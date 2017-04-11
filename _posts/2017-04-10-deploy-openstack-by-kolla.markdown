---
layout: post
title:  "Kolla部署多节点Openstack"
date:   2017-04-10 13：08:09 -0800
categories: Openstack
tags: Openstack Kolla
---

最近在搞Openstack社区做贡献，想看看Kolla项目是否可以参与。就自己通过Kolla部署了一套Openstack+Ceph的环境。

# Kolla 介绍
Kolla项目利用Docker、Ansible来完成部署OpenStack。主要是利用Docker容器的隔离性来达到OpenStack的原数据升级、回退再升级。整个升级、回退的过程更容易控制影响范围，降低整个OpenStack的运维复杂度。Kolla提供了生产级别的OpenStack Service Containers。基于社区的最佳实践，提供了更好、更快、更可靠的 、易操作 OpenStack的部署工具。

解决的问题：
* 平滑的升级/回滚 OpenStack
* 隔离 OpenStack不同组件的依赖环境，尤其是那些使用同一模块不同版本的情况。
* 保证环境的一致性。解决由于安装时间不同，造成的包版本不一致的情况。
* 支持多种安装源：源代码安装，CentOS binary 安装等。可以替代掉devstack。

其实这些问题只要是由 Docker 来解决的。这也是Kolla使用Docker的原因。

Kolla 主要包括两个项目：
1. Kolla 主要负责所有Openstack docker镜像的生成
2. Kolla-ansible 主要通过Ansible 部署Openstack所有服务的docker镜像

整个部署过程也就分为两个部分：
1. 生成需要的Openstack服务的Docker镜像
2. 定义部署topology， 通过Ansible部署整个Openstack集群

# 部署过程

## 1. 环境准备
4台Esxi虚拟机, 操作系统centos7：   
| hostname | mng int | ceph int | ext int|  sda| sdb | sdc | sdd |
| :-------- | --------:| --------:| --------:| --------:| --------:| :--: | 
| kolla1 | 192.168.8.70 |  10.10.9.101   |  for br-ex | sys | osd1 |osd2 | journal |
| kolla2 | 192.168.8.71 |  10.10.9.102   | for br-ex | sys | osd1 | osd2 | journal |
| kolla3 | 192.168.8.72 |  10.10.9.103   | for br-ex | sys | osd1 | osd2 | joournal |
| kollar | 192.168.8.73 |      | ||||

kolla{1,2,3}是用来部署Openstack集群， kollar是用来生成dockker镜像的和作为私有docker hub的机器。

所有机器执行：
```
yum install epel-release
yum install python-pip
pip install -U pip
yum install python-devel libffi-devel gcc openssl-devel
yum install ansible
pip install -U ansible

curl -sSL https://get.docker.io | bash
docker --version

# Create the drop-in unit directory for docker.service
mkdir -p /etc/systemd/system/docker.service.d

# 这个不配置的话， ansible 部署时候会检查不过
tee /etc/systemd/system/docker.service.d/kolla.conf <<-'EOF'
[Service]
MountFlags=shared
EOF

#配置时间同步
yum install ntp
systemctl enable ntpd.service
systemctl start ntpd.service

#先disable libvirt服务， kollar可以不做
systemctl stop libvirtd.service
systemctl disable libvirtd.service
```

## 2. 下载安装kolla&kolla-ansible
所有机器都执行：
```
git clone  https://github.com/openstack/kolla
git clone https://github.com/openstack/kolla-ansible

cd kolla
#我以为Openstack节点可以不安装Kolla，结果部署的时候需要去Kolla生成的配置文件拷贝配置文件，部署失败了。 生成镜像的机器和集群节点机器都需要安装Kolla
pip install -r requirements.txt
pip install .
```

## 3. 生成镜像
生成镜像只需要在kollar节点执行即可
```
 # kolla-build –b centos –t binary –p default
``` 
参数介绍:
  * -b 指定build的镜像系统类型
  * -t binary为二进制安装 source为源码安装
  * -p 指定build哪些镜像. 如果不指定－p 可以单独指定build某个，如：nova

default包含哪些镜像可以查看如下kolla-build.conf内容：
```
[profiles]
infra = ceph,data,mariadb,haproxy,keepalived,kolla-ansible,memcached,mongodb,openvswitch,rabbitmq
main = cinder,ceilometer,glance,heat,horizon,keystone,neutron,nova,swift
aux = designate,gnocchi,ironic,magnum,zaqar
default = data,kolla-ansible,glance,haproxy,heat,horizon,keepalived,keystone,memcached,mariadb,neutron,nova,openvswitch,rabbitmq,rsyslog
gate = ceph,cinder,data,dind,glance,haproxy,heat,horizon,keepalived,keystone,kolla-ansible,mariadb,memcached,neutron,nova,openvswitch,rabbitmq,rsyslog
```

如果是基本安装，default就可以了。如果有特殊的组件需要安装，需要根据profiles选择来生成镜像或者手动自己单个生成镜像。 比如这里需要安装ceph，就需要手工生成ceph相关的docker镜像。 这里有点坑， default里边竟然没有cinder， cinder也需要手动build。我build的是default，貌似gate更符合我的要求。

```
# kolla-build –b centos –t binary –p ceph
# kolla-build –b centos –t binary –p cinder
```

## 3. 搭建私有docker registry
其实不用搭建私有docker registry也是可以的。但是国内访问docker hub网速太慢，Openstack的docker镜像动辄几百M，有的上G。所以搭建一个私有docker registry可以本地按照上边的步骤生成好docker镜像，然后配置所有机器的通过私有docker registry下载镜像，可以加快部署速度。

搭建docker registry过程坑比较多：
1. docker registry需要用v2 tag。 我开始没有加v2 tag，启动了registry后报各种莫名奇妙的错误。 直接用v2 tag启动就好了。
2. docker client最好升级到最新，如果是通过操作系统自带的包管理器安装的，有可能版本太低，导致不能正常push。 报一堆https相关错误。

启动docker registry其实很简单，一条命令搞定。 本地没有 v2 tag的registry镜像的话，会自动从docker.io下载。
```
# docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

私有的docker registry启动后，push本地的docker image 到私有的registry。

```
[root@kollar ~]# cat test.sh
#导出所有的kolla相关镜像名称到文件 
docker images |grep "kolla" |awk '{print $1}' > kolla.txt
for i in `cat kolla.txt`
do
    #给自己build的docker镜像打上标签， tag 4.0.0是pike版本的标签
    docker tag $i:4.0.0 192.168.8.73:5000/$i:4.0.0 
    #push打了标签的docker image到私有的registry
    docker push 192.168.8.73:5000/$i
    #下边这个是我环境docker-py版本低，不能在Openstack集群节点pull下来镜像，我就写了个脚本把所有的镜像通过dockerclient手动下载到每一个节点。需要手动到每一个Openstack集群节点去执行。
    #docker pull 192.168.8.73:5000/$i:4.0.0
done
```

## 4. 部署Openstack
### 4.1 配置文件修改
将三台集群节点都按照上面安装kolla，然后3台互相免密码登录，编辑hosts文件，关闭防火墙和selinux
```
# cp -r /usr/share/kolla/etc_examples/kolla /etc/ 
# kolla-genpwd   ＃自动填充密码文件 
```
/etc/kolla/passwords.yml，这个文件里面的密码都可以指定，如
keystone_admin的密码，可以改为自定义

修改/etc/kolla/globals.yml文件:
```
[root@kollar ~]# cat /etc/kolla/globals.yml |grep ^[^#]
---
kolla_base_distro: "centos"
kolla_install_type: "binary"
openstack_release: "4.0.0"
kolla_internal_vip_address: "192.168.8.75"
docker_registry: "192.168.8.73:5000"
docker_namespace: "kolla"
network_interface: "eno16780032"
cluster_interface: "eno33559296"
neutron_external_interface: "eno50338560"
enable_ceph: "yes"
enable_ceph_rgw: "yes"
enable_cinder: "yes"
enable_cinder_backend_iscsi: "no"
enable_cinder_backend_lvm: "no"
enable_cinder_backend_nfs: "no"
enable_heat: "yes"
enable_horizon: "yes"
enable_horizon_magnum: "{{ enable_magnum | bool }}"
enable_horizon_watcher: "{{ enable_watcher | bool }}"
enable_magnum: "no"
designate_backend: "bind9"
designate_ns_record: "sample.openstack.org"
tempest_image_id:
tempest_flavor_ref_id:
tempest_public_network_id:
tempest_floating_network_name:
```

定义那些节点安装那些服务：
```
[root@kollar ~]# cat /etc/kolla/multinode 
[control]
# These hostname must be resolvable from your deployment host
kolla1
kolla2
kolla3

[network]
kolla1
kolla2
kolla3

[compute]
kolla1
kolla2
kolla3

[monitoring]
kolla1
```
只需要修改前边几个初始的组即可， 需要精细控制部署方式的话，可以修改后边的内容。根据自己需求定义组和机器的对应关系。

### 4.2 ceph准备
在3台虚拟机的节点上，除去系统盘还有有其它3块硬盘，sdb、sdc、sdd
这里我们将sdb和sdc做为osd节点，sdd为日志节点。Kolla对ceph的osd及日志盘的识别是通过卷标来实现的，
如osd的卷标为KOLLA_CEPH_OSD_BOOTSTRAP,
journal的卷标为KOLLA_CEPH_OSD_BOOTSTRAP_J

格式化所有osd的磁盘，这里我们用ansible统一执行：
```
# ansible -i multinode all -m shell -a 'parted /dev/sdb -s -- mklabel gpt mkpart KOLLA_CEPH_OSD_BOOTSTRAP 1 -1'  
# ansible -i multinode all -m shell -a 'parted /dev/sdc -s -- mklabel gpt mkpart KOLLA_CEPH_OSD_BOOTSTRAP 1 -1'
```
格式所有journal的盘
```
# ansible -i multinode all -m shell -a 'parted /dev/sdd -s -- mklabel gpt mkpart KOLLA_CEPH_OSD_BOOTSTRAP_J 1 -1'  
```
新建/etc/kolla/config/ceph.conf，指定ceph的一些参数，如副本数：
```
[global]  
osd pool default size = 1  
osd pool default min size = 1
```

## 5. 开始安装
先检查有无错误：
```
# kolla-ansible -i multinode prechecks  
```

没有报错直接进行安装：
```
# kolla-ansible -i multinode deploy  
```

直至安装完成
生成rc文件(生成的文件在/etc/kolla/下面)：
```
# kolla-ansible -i multinode post-deploy
```

### 部署失败处理
1. Ansible相关的日志都在syslog中， centos在/var/log/message里
2. docker内部命令失败，可以手动启动docker镜像，然后进入docker执行相关命令，查看错误日志。
3. 通过docker inspect dockerid也可以看到容器挂载的日志目录/var/lib/docker/volumes/kolla_logs/_data。
4. 部署失败，报'Fetching Ceph keyrings ... No JSON object could be decoded'，执行
```
ansible -i multinode -a 'docker volume rm ceph_mon_config'  ceph-mon
```
通常是因为第一次部署失败了，导致ceph的配置文件的启动的有问题导致的。
5. mariadb启动不了，连接超时。 手动重新启动一下mariadb。我部署的时候由于虚拟机OOM，重启后mariadb容器自动启动，但是端口没有代码，部署的时候就报超时，手动重启mariadb容器，问题解决。最后的结果应该如下面：
```
[root@kolla1 ~]# netstat -ntlp |grep 3306
tcp        0      0 192.168.8.70:3306       0.0.0.0:*               LISTEN      20536/mysqld        
tcp        0      0 192.168.8.75:3306       0.0.0.0:*               LISTEN      15500/haproxy 
```

# 扩展







