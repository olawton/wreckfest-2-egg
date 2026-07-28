# ---------------------------------------------
# Steam Proton image
# ---------------------------------------------
FROM        debian:trixie-slim

LABEL       author="Torsten Widmann" maintainer="info@goover.de"

# Install required packages
RUN         dpkg --add-architecture i386
RUN         apt update
RUN         apt install -y --no-install-recommends \
                wget \
                iproute2 \
                gnupg2 \
                software-properties-common \
                libntlm0 \
                winbind \
                xvfb \
                xauth \
                libncurses-dev:i386 \
                libncurses6 \
                dbus \
                libgdiplus \
                lib32gcc-s1 \
                libc6
RUN         apt install -y \
                alsa-tools \
                libpulse0 \
                pulseaudio \
                libpulse-dev \
                libasound2-dev \
                libao-common \
                gnutls-bin \
                gnupg \
                locales \
                cabextract \
                curl \
                python3 \
                python3-pip \
                python3-setuptools \
                tini \
                file \
                pipx

# Download Proton GE
RUN         curl -sLOJ "$(curl -s https://api.github.com/repos/GloriousEggroll/proton-ge-custom/releases/latest | grep browser_download_url | cut -d\" -f4 | grep -v aarch64 | egrep .tar.gz)"
RUN         tar -xzf GE-Proton*.tar.gz -C /usr/local/bin/ --strip-components=1
RUN         rm GE-Proton*.*

# Proton Fix machine-id
RUN         rm -f /etc/machine-id
RUN         dbus-uuidgen --ensure=/etc/machine-id
RUN         rm /var/lib/dbus/machine-id
RUN         dbus-uuidgen --ensure

# Setup Protontricks
RUN         pipx install protontricks

# Set up Winetricks
RUN	        wget -q -O /usr/sbin/winetricks https://raw.githubusercontent.com/pelican-eggs/winetricks/master/src/winetricks \
            && chmod +x /usr/sbin/winetricks

# Install rcon
RUN         cd /tmp/ \
            && curl -sSL https://github.com/gorcon/rcon-cli/releases/download/v0.10.3/rcon-0.10.3-amd64_linux.tar.gz > rcon.tar.gz \
            && tar xvf rcon.tar.gz \
            && mv rcon-0.10.3-amd64_linux/rcon /usr/local/bin/

# Download the latest Wreckfest 2 headless server wrapper
RUN         mkdir -p /opt/wreckfest2-headless \
            && curl -fL --retry 3 \
                https://github.com/olawton/wreckfest-2-headless-server/releases/latest/download/Wreckfest2-headless.exe \
                -o /opt/wreckfest2-headless/Wreckfest2-headless.exe \
            && test -s /opt/wreckfest2-headless/Wreckfest2-headless.exe \
            && chmod 0644 /opt/wreckfest2-headless/Wreckfest2-headless.exe

# Setup user and working directory
RUN         useradd -m -d /home/container -s /bin/bash container

# Runtime user/env
USER        container
ENV         USER=container HOME=/home/container
WORKDIR     /home/container

# Copy default Wreckfest 2 server-config
COPY        --chown=container:container ./../server_config.scnf.template /server_config.scnf.template

STOPSIGNAL  SIGINT

COPY        --chown=container:container ./../entrypoint.sh /entrypoint.sh
RUN         chmod +x /entrypoint.sh
ENTRYPOINT  ["/usr/bin/tini", "-g", "--"]
CMD         ["/entrypoint.sh"]
