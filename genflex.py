#!/usr/bin/env python3

def p(s, indent):
    print("{}{}".format(" " * indent, s))

def pflex(i, indent, prefix=None):
    if prefix is None:
        prefix = ""
    else:
        prefix += "-"
    p(".{}flex-{} {{".format(prefix, i), indent)
    p("flex-basis: {}%;".format(i), indent + 4)
    p("}", indent)

def pflexes(indent, prefix=None):
    for i in range(101):
        pflex(i, indent, prefix)

pairs = [(0, None), (480, "xs"), (800, "sm"), (1200, "md"), (1800, "l"), (2000, "xl"), (2700, "xxl")]

for (width, prefix) in pairs:
    print("@media screen and (min-width: {}px) {{".format(width))
    pflexes(4, prefix)
    print("}")

