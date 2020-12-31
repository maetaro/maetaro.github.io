Getting Started
===============

Introduction to simpleparser
----------------------------

simpleparser is a parser combinator.

Introduction to parser combinator
---------------------------------

Combine functions to decompose the target in an appropriate
and easy-to-understand expression.

Quic Start
----------

install by pip.

>>> # not yet.
>>> # pip install simpleparser

then, start python interpreter.

>>> python
>>> from simpleparser import token
>>> p = token("foo")
>>> p.exec("foobar")
['foo']

token function is create parser functin object.