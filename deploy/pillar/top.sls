{% set environment = salt['grains.get']('environment', default='development') %}

base:
  '*':
    - {{ environment }}.os
    - {{ environment }}.project
