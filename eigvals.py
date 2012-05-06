import itertools
import json
import numpy
import operator
import sys


def eigvals_json(data):
    eigvals, eigvectors = numpy.linalg.eig(numpy.array(data))
    eigdata = [(e[0], e[1]) for e in
               itertools.izip(eigvals.real, eigvectors.real)]
    eigdata.sort(key=operator.itemgetter(0), reverse=True)
    return {
        'eigenvalues': [e[0] for e in eigdata],
        'eigenvectors': [e[1].tolist() for e in eigdata],
    }


def main(args):
    if len(args) != 1:
        sys.stderr.write('bad arguments\n')
        return 1
    data = json.loads(open(args[0]).read())
    print json.dumps(eigvals_json(data))


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]) or 0)
