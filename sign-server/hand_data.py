import time
import collections
from lib import Leap
from lib.Leap import Bone


ACTION_GESTURE_LEFT = "swipe_left"
ACTION_GESTURE_RIGHT = "swipe_right"
ACTION_GESTURE_CIRCLE = "circle"
ACTION_GESTURE_CIRCLE_CLOCKWISE = "circle_clockwise"
GESTURE_BLOCKING = "block"



def get_hand_and_gesture(controller):
    hand_pos = get_hand_position(controller)
    gesture = get_current_gesture(controller.frame())

    return hand_pos, gesture

'''
gets the current frame from controller
for each finger, stores the topmost end of each bone (4 points)
adjusts bone location relativity by subtracting the center of the palm
returns the adjusted bone locations in the form:
{feat0=some_float, feat1=some_float, ... feat59=some_float}
'''
def get_hand_position(controller, blocking=False):
    frame = controller.frame()


    if not blocking and len(frame.fingers) == 0:
        return None

    while len(frame.fingers) == 0:
        frame = controller.frame()

    fingers = controller.frame().fingers
    finger_bones = []
    for finger in fingers:
        finger_bones.append(finger.bone(Bone.TYPE_METACARPAL).next_joint)
        finger_bones.append(finger.bone(Bone.TYPE_PROXIMAL).next_joint)
        finger_bones.append(finger.bone(Bone.TYPE_INTERMEDIATE).next_joint)
        finger_bones.append(finger.bone(Bone.TYPE_DISTAL).next_joint)

    # possible issue when more than one hand
    hands = controller.frame().hands
    hand_center = 0
    for hand in hands:
        hand_center = hand.palm_position

    calibrated_finger_bones = collections.OrderedDict()
    for i in range(len(finger_bones)):
        normalized_joint = (finger_bones[i] - hand_center).to_tuple()
        for j in range(3):
            calibrated_finger_bones["feat" + str(i*3+j)] = normalized_joint[j]

    return calibrated_finger_bones

previous_progress = 0

def get_current_gesture(frame):
    for gesture in frame.gestures():
        if gesture:
            print("id " + str(gesture.id))
            if(gesture.state==Leap.Gesture.STATE_STOP):
                print("***STOPPED****")

            elif(gesture.state==Leap.Gesture.STATE_UPDATE):
                print("*** UPDATING ****")

            else:

                print("***    MOOOOOOVIIIING ****")

            if gesture.type is Leap.Gesture.TYPE_CIRCLE:
                circle = Leap.CircleGesture(gesture)


                if(circle.progress > 1):
                    print("*CIRCLE*")
                    print(circle.progress)
                    global previous_progress

                    if(circle.progress == previous_progress):
                        previous_progress = 0
                        if (circle.pointable.direction.angle_to(circle.normal) <= Leap.PI/2):
                            return ACTION_GESTURE_CIRCLE_CLOCKWISE
                        return ACTION_GESTURE_CIRCLE
                    previous_progress = circle.progress

            if gesture.type is Leap.Gesture.TYPE_SWIPE:
                swipe = Leap.SwipeGesture(gesture)
                print("speed " + str(swipe.speed))
                print("start " + str(swipe.start_position))
                print("position" + str(swipe.position))

                if (swipe.direction.x > 0):
                    return ACTION_GESTURE_RIGHT
                return ACTION_GESTURE_LEFT
        print("BLOCK")
        return GESTURE_BLOCKING

    return None


if __name__ == "__main__":

    controller = Leap.Controller()

    while True:
        get_hand_position(controller)
        time.sleep(1)
