import json
import numpy
import sys


SIDE = 19


def normalize(eigvals):
    minval = min(eigvals)
    maxval = max(eigvals)
    diff = maxval - minval
    return numpy.array([(e - minval) / diff * 255 for e in eigvals])


def eigvals_json(data):
    arr = numpy.array(data)
    eigvals = numpy.linalg.eigvals(arr).real
    vals = normalize(eigvals)
    return vals.reshape(SIDE, SIDE).tolist()


def main(args):
    if len(args) != 1:
        sys.stderr.write('bad arguments\n')
        return 1
    ifile = args[0]
    data = json.loads(open(ifile).read())
    print json.dumps(eigvals_json(data))


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]) or 0)
