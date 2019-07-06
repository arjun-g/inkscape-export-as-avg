#!/usr/bin/env python
#-*- coding: utf-8 -*-
import sys, inkex, os
import traceback

class ExportAsAVG (inkex.Effect):

    def __init__(self):
        inkex.Effect.__init__(self)

        self.OptionParser.add_option('--tabs', action='store', type='string', dest='tab')

    def effect(self):
        if sys.platform == 'darwin':
            command = './node/bin/node export_as_avg.js ' + self.args[0]
        elif sys.platform == 'win32':
            command = 'node.exe export_as_avg.js ' + self.args[0]

        result = os.popen(command).read()

        sys.stdout.write(result)
        sys.stdout.close()

if __name__ == '__main__':
    ext = ExportAsAVG()
    ext.affect(output=False)