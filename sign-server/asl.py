from db import get_all_data, NUM_FEATURES, get_model_data
import collections



def get_data(model_name):
    data = []
    target = []

    for row in get_model_data(model_name):
        data.append([row['feat' + str(i)] for i in range(NUM_FEATURES)])
        target.append(row['sign'])

    return data, target
