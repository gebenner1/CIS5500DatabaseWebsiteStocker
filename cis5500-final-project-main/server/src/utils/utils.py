import time


def retry(f):
    def g(*args, **kwargs):
        for i in range(1, 4):
            try:
                return f(*args, **kwargs)
            except Exception as e:
                print(e)

    return g
