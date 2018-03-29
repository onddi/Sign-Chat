from classifier import getModel, trainModel
from flask import Flask, render_template, jsonify, request, json
from hand_data import get_hand_position
from lib import Leap
from db import get_all_models
import pickle
import random
import redis
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

controller = Leap.Controller()
controller.set_policy(Leap.Controller.POLICY_BACKGROUND_FRAMES)

past_symbol = 'a'
prev_prediction = None

r = redis.StrictRedis(host='localhost', port=6379, db=0)

currentModel = None


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

@app.route('/current')
def current_symbol():
    global past_symbol
    global prev_prediction
    global currentModel
    # Is there a hand?
    hand_pos = get_hand_position(controller)
    if not hand_pos:
        new = past_symbol != ' '
        past_symbol = ' '
        return jsonify(symbol=' ', new=new)
    features = [v for k, v in hand_pos.iteritems()]

    if currentModel == None:
        #print("current NONE")
        currentModel = getModel('clf')

    if currentModel == 'ERROR':
        return jsonify(error='No model of that name')

    # Do we have a new symbol?
    prediction = ''.join(currentModel.predict(features))
    print("Predicted hand symbol", prediction)
    #print("Probability", currentModel.predict_proba(features))
    if prediction == prev_prediction:
        # We good fam
        print(prediction)
        return jsonify(new=False, symbol=prediction)
    else:
        prev_prediction = prediction
        return jsonify(new=True, symbol=prediction)


@app.route('/splash')
def splash():
    return render_template('splash.html')


@app.route('/scoreboard')
def scoreboard():
    return jsonify(user_score=100)


if __name__ == '__main__':
    app.run(debug=True)
