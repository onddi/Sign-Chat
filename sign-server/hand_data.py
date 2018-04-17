import time
import collections
from lib import Leap
from lib.Leap import Bone


ACTION_GESTURE_LEFT = "swipe_left"
ACTION_GESTURE_RIGHT = "swipe_right"
ACTION_GESTURE_CIRCLE = "circle"




def get_hand_and_gesture(controller):
    hand_pos, frame = get_hand_position(controller)
    gesture = get_current_gesture(frame)

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
        return None, frame

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

    return calibrated_finger_bones, frame

def get_current_gesture(frame):
    for gesture in frame.gestures():
        if gesture:
            print(gesture.type)
            if gesture.type is Leap.Gesture.TYPE_CIRCLE:
                # print("*CIRCLE*")

                # if(gesture.state==Leap.Gesture.STATE_STOP):
                #     print("***STOPPED****")
                #
                # elif(gesture.state==Leap.Gesture.STATE_UPDATE):
                #     print("*** UPDATING ****")
                #
                # else:
                #
                #     print("***    MOOOOOOVIIIING ****")
                circle = Leap.CircleGesture(gesture)
                print(circle.progress)

                return ACTION_GESTURE_CIRCLE
            if gesture.type is Leap.Gesture.TYPE_SWIPE:
                swipe = Leap.SwipeGesture(gesture)
                if (swipe.direction.x > 0):
                    return ACTION_GESTURE_RIGHT
                return ACTION_GESTURE_LEFT

    return None


if __name__ == "__main__":

    controller = Leap.Controller()

    while True:
        get_hand_position(controller)
        time.sleep(1)
