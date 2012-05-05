import json
import numpy
import sys


def eigvals_json(data):
    arr = numpy.array(data)
    return numpy.linalg.eigvals(arr).real.tolist()


def main(args):
    if len(args) != 1:
        sys.stderr.write('bad arguments\n')
        return 1
    ifile = args[0]
    data = json.loads(open(ifile).read())
    print json.dumps(eigvals_json(data))


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]) or 0)
