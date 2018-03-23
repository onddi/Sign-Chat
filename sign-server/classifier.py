'''
Usage:

    from classifier import clf
    clf.predict(test_data)
'''
from sklearn import svm
from sklearn.externals import joblib

def get_path(model_name):
    return 'sign-models/' + model_name + '.pkl'

def getModel(model_name):
    try:
        return joblib.load(get_path(model_name))
    except:
        return 'ERROR'

def trainModel(model_name):
    from asl import get_data
    data, target = get_data(model_name)
    clf = svm.SVC(gamma=0.0001, C=50, probability=True)
    clf.fit(data, target)
    print("Creating model "+ model_name +" based on current database content")
    joblib.dump(clf, get_path(model_name))

#try:
#    clf = joblib.load(FILENAME)
#except:
#    import asl
#    clf = svm.SVC(gamma=0.0001, C=50, probability=True)
#    clf.fit(asl.data, asl.target)
#    joblib.dump(clf, FILENAME)
