{% set user = salt['pillar.get']('project:user') %}
{% set src_dir = salt['pillar.get']('project:src_dir') %}
{% set nvm_install_path = salt['pillar.get']('nvm:install_path', '/opt/nvm') %}

https://github.com/creationix/nvm.git:
  git.latest:
    - rev: master
    - target: {{ nvm_install_path }}
    - force: True

nvm_profile:
  file.blockreplace:
    - name: /etc/profile
    - marker_start: "#> Saltstack Managed Configuration START <#"
    - marker_end: "#> Saltstack Managed Configuration END <#"
    - append_if_not_found: true
    - content: |
        if [ -f "{{ nvm_install_path }}/nvm.sh" ]; then
          source {{ nvm_install_path }}/nvm.sh
        fi

nvm-install:
  cmd.run:
    - name: source {{ nvm_install_path }}/nvm.sh; nvm install v5.5.0
    - require:
      - file: nvm_profile

node-packages:
  pkg.installed:
    - pkgs:
      - pkg-config
      - libcairo2-dev
      - libjpeg-dev

npm-install:
  cmd.run:
    - name: 'source {{ nvm_install_path }}/nvm.sh; npm install --no-bin-links'
    - cwd: {{ src_dir }}
    - user: {{ user }}
    - require:
      - pkg: node-packages
      - cmd: nvm-install
