from sqlalchemy import create_engine, MetaData, Table, Column, Numeric, String
from sqlalchemy.sql import select, column
import random

NUM_FEATURES = 60

def get_engine_and_table():
    engine = create_engine('sqlite:///asl_data.db', echo=True)

    metadata = MetaData()
    columns = [Column('feat' + str(i), Numeric) for i in range(NUM_FEATURES)]
    columns.append(Column('sign', String()))
    columns.append(Column('model', String()))
    tagged_data = Table('tagged_data', metadata, *columns)

    metadata.create_all(engine)

    return engine, tagged_data

engine, tagged_data = get_engine_and_table()
conn = engine.connect()

'''
add_data usage:

    features = dict(zip(['feat' + str(i) for i in range(NUM_FEATURES)],
        [random.uniform(0, 10) for _ in range(NUM_FEATURES)])
    )
    add_data(model='clf', sign='a', **features)
'''
def add_data(model_name, sign, **features):
    if len(features) != NUM_FEATURES:
        raise ValueError('Expected ' + str(NUM_FEATURES) + ' features, got ' + str(len(features)))

    ins = tagged_data.insert().values(model=model_name, sign=sign, **features)
    conn.execute(ins)

def get_all_data():
    sel = select([tagged_data])
    return conn.execute(sel)

def get_model_data(model_name):
    model = column('model')
    sel = select([tagged_data]).where(model == model_name)
    return conn.execute(sel)

if __name__ == '__main__':
    print 'Adding random data to database'
    features = dict(zip(['feat' + str(i) for i in range(NUM_FEATURES)],
        [random.uniform(0, 10) for _ in range(NUM_FEATURES)])
    )
    add_data(model='random', sign='b', **features)
