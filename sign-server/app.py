from classifier import getModel, trainModel, get_path
from flask import Flask, render_template, jsonify, request, json
from hand_data import get_hand_position
from lib import Leap
from db import get_all_models, get_model_signs, delete_sign
import pickle
import random
import redis
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit
import time
from db import add_data

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)

controller = Leap.Controller()
controller.set_policy(Leap.Controller.POLICY_BACKGROUND_FRAMES)
controller.enable_gesture(Leap.Gesture.TYPE_CIRCLE)
controller.enable_gesture(Leap.Gesture.TYPE_SWIPE)
controller.enable_gesture(Leap.Gesture.TYPE_KEY_TAP)
controller.enable_gesture(Leap.Gesture.TYPE_SCREEN_TAP)

past_symbol = 'a'
prev_prediction = None

r = redis.StrictRedis(host='localhost', port=6379, db=0)

currentModel = None

read_sign = False
read_gestures = False


ACTION_TRAINING_START = "training_start"
ACTION_TRAINING_INPROGRESS = "training_inprogress"
ACTION_TRAINING_DONE = "training_done"
ACTION_TRAINING_ERROR = "training_error"

ACTION_GESTURE = "gesture"

ACTION_SIGN = "sign_prediction"


@app.route('/translate')
def translate():
    return render_template('ui.html')


@app.route('/')
def tutorial():
    return render_template('tutorial.html')


@app.route('/score', methods=['POST'])
def add_score():
    data = request.form
    try:
        record = json.dumps(
            {'user': data['user'], 'score': int(data['score'])})
        print record
        result = r.lpush('scoreboard', record)
        return jsonify(error=result)
    except KeyError:
        return jsonify(error=True)


@app.route('/scores', methods=['GET'])
def get_scores():
    scores = [json.loads(i) for i in r.lrange('scoreboard', 0, 100)]
    scores.sort(key=lambda s: s['score'], reverse=True)
    return jsonify(scores=scores[:10])


@app.route('/set_model', methods=['GET'])
def set_model():
    model_name = request.args.get('model')
    global currentModel
    currentModel = getModel(model_name)
    if(currentModel != 'ERROR'):
        return jsonify(currentModel=model_name)
    return jsonify(currentModel='ERROR')


@app.route('/train_model', methods=['GET'])
def train_model():
    model_name = request.args.get('model')
    global currentModel
    currentModel = trainModel(model_name)
    return jsonify(currentModel=model_name)


@app.route('/models', methods=['GET'])
def get_models():
    models = []
    rows = get_all_models().fetchall()
    for r in rows:
        models.append(str(r))
        print(r)
    print(models)
    return jsonify(models=models)

# delete/model=alexas&sign=somethin
@app.route('/delete', methods=['GET'])
def remove_sign():
    model = request.args.get('model')
    sign = request.args.get('sign')
    delete_sign(model, sign)
    return jsonify(ok="ok")


@app.route('/models/<model_name>', methods=['GET'])
def get_signs(model_name):
    signs = get_model_signs(model_name)
    return json.dumps([dict(r) for r in signs])


@socketio.on('start_sign_reading')
def start_sign_reading():
    global read_sign
    read_sign = True
    read_leap()


@socketio.on('stop_sign_reading')
def stop_sign_reading():
    global read_sign
    read_sign = False


def read_leap():
    global read_sign
    while read_sign or read_gestures:
        sign, gesture = current_symbol()
        if gesture:
            print(gesture)
            socketio.emit(ACTION_GESTURE, gesture)
        if sign:
            print(sign)
            socketio.emit(ACTION_SIGN, sign)
        time.sleep(.1)


@app.route('/start')
def s():
    start_sign_reading()
    return jsonify(ok="ok")

@app.route('/stop')
def st():
    stop_sign_reading()
    return jsonify(ok="ok")

@app.route('/current')
def get_current():
    sign, gesture = current_symbol()
    return jsonify(new=False, symbol=sign)


def current_symbol():
    global past_symbol
    global prev_prediction
    global currentModel
    # Is there a hand?
    hand_pos, gesture = get_hand_position(controller)
    if not hand_pos:
        new = past_symbol != ' '
        past_symbol = ' '
        return None, gesture
    features = [v for k, v in hand_pos.iteritems()]

    if currentModel == None:
        #print("current NONE")
        currentModel = getModel('clf')

    if currentModel == 'ERROR':
        return None, gesture

    # Do we have a new symbol?
    prediction = ''.join(currentModel.predict(features))
    print("Predicted hand symbol", prediction)
    #print("Probability", currentModel.predict_proba(features))
    return prediction, gesture


@app.route('/splash')
def splash():
    return render_template('splash.html')


@app.route('/scoreboard')
def scoreboard():
    return jsonify(user_score=100)


@socketio.on('connect')
def test_connect():
    print("CONNECTED")
    emit('sign_event', {'data': 'Connected'})


@socketio.on('train_sign')
def handle_my_custom_event(data):
    sign = data['sign']
    model = data['model']
    emit(ACTION_TRAINING_START, "Place your hand on the leap motion")
    train_char(model, sign)


NUM_SAMPLES = 100
SAMPLE_DELAY = .1
NUM_FEATURES = 60


def train_char(model_name, training_word):
    for t in range(NUM_SAMPLES):
        time.sleep(SAMPLE_DELAY)
        sample = get_hand_position(controller, True)
        while len(sample) != NUM_FEATURES:
            emit(ACTION_TRAINING_ERROR, "Please place only right hand in view")
            # print "Please place only right hand in view"
            sample = get_hand_position(controller, True)
        print sample
        if t % 10 == 0:
            emit(ACTION_TRAINING_INPROGRESS, str(t) + "/" + str(NUM_SAMPLES))
        add_data(model_name=model_name, sign=training_word, **sample)
    emit(ACTION_TRAINING_DONE, "donezki")


import os.path


def init_models():
    models = get_all_models()
    for model in models:
        create_if_not_exists(model['model'])


def create_if_not_exists(model_name):
    file_name = get_path(model_name)
    print(file_name)
    if not os.path.isfile(file_name):
        trainModel(model_name)


if __name__ == '__main__':
    init_models()
    socketio.run(app,debug=True)
    # app.run(debug=True)
