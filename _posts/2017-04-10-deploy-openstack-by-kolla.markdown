---
layout: post
title:  "Openstack Kolla实战"
date:   2017-04-10 13：08:09 -0800
categories: Openstack
tags: Openstack Kolla
---


[TOC]

最近在搞Openstack社区做贡献，想看看Kolla项目是否可以参与。就自己通过Kolla部署了一套Openstack+Ceph的环境。

# 一、Kolla 介绍
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

# 二、部署过程

## 2.1 环境准备
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

## 2.2 下载安装kolla&kolla-ansible
所有机器都执行：
```
git clone  https://github.com/openstack/kolla
git clone https://github.com/openstack/kolla-ansible

cd kolla
#我以为Openstack节点可以不安装Kolla，结果部署的时候需要去Kolla生成的配置文件拷贝配置文件，部署失败了。 生成镜像的机器和集群节点机器都需要安装Kolla
pip install -r requirements.txt
pip install .
```

## 2.3 生成镜像
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

## 2.4 搭建私有docker registry
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

## 2.5 部署Openstack
### 2.5.1 配置文件修改
将三台集群节点都按照上面安装kolla，然后3台互相免密码登录，编辑hosts文件，关闭防火墙和selinux
配置docker 访问私有的registry, 修改/usr/lib/systemd/system/docker.service文件, 添加本地库地址，重启docker服务
```
ExecStart=/usr/bin/dockerd  --insecure-registry 192.168.8.73:5000
```

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

### 2.5.2 ceph准备
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

### 2.5.3 开始安装
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
### 2.5.4 安装完成测试
经过上边的步骤的等待和安装， 安装结完成后。怎么测试安装的Openstack是不是正常的呢？

1. 先通过kolla-ansible的命令做个冒烟测试
```
kolla-ansible -i multinode check 
```
2, 通过命令行测试。 在需要通过命令行操作Openstack的机器上安装openstack-client
```
pip install -U python-openstackclient python-neutronclient
source admin-openrc.sh
```
admin-openrc.sh就是安装完成后执行的post-deploy生成的。
测试Openstack命令行之行：
```
[root@kollar kolla]# nova list
+----+------+--------+------------+-------------+----------+
| ID | Name | Status | Task State | Power State | Networks |
+----+------+--------+------------+-------------+----------+
+----+------+--------+------------+-------------+----------+
```
3. 通过horizon访问Openstack。

### 2.5.5 部署失败处理
1. Ansible相关的日志都在syslog中， centos在/var/log/message里
2. docker内部命令失败，可以手动启动docker镜像，然后进入docker执行相关命令，查看错误日志, 或者docker logs dockerid。
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
6. 容器启动问题。 容器启动过程中出问题，比如容器启动后由于某种错误导致容器退出&重启。 可以根据
```
docker instpect <dockerid>
```
查看输出中的LogPath对应的文件，查看看docker启动失败原因。
7. 实在遇到不能解决的问题时候，就用 kolla-ansible -i multinode destroy 彻底删除重新安装。我就遇到了mariadb集群异常关闭，手动半天恢复不了。当时不知道有 mariadb recovery的功能，就destroy了整个部署，然后重新部署的。

# 三、扩展

## 3.1 升级
假设初始部署的是4.0。0（pike）， 修改global.yml
```
openstack_version: 4.0.0
```
部署集群
```
kolla-ansible deploy
```

版本做了修改，需要升级一个小版本，修改global.yml
```
openstack_version: 4.0.1
```
升级集群
```
kolla-ansible upgrade
```

>**注意：** 
1. 升级过程中libvirt的容器中如果还有虚拟机在运行，升级可能失败，Kolla社区还在努力解决中
2. Kolla社区建议使用brtfs或者aufs来存储容器数据， lvm的driver可能会导致有些容器不能删除。

## 3.2 一键部署
1. Build docker镜像的机器可以做成一个虚拟机（部署机）， 提前build好所有的Kolla镜像， 内置一个registry，导入所有自己build的Kolla镜像到registry。
2. 部署机安装Kolla, Kolla-ansible, 内置脚本配置前期的准备工作， 关闭防火墙， 配置无密码访问，域名等。通过ansible批量在所有机器执行。
3. 开始部署时只需要根据自己的集群的topology调整 inventory中的topology文件， 调整global.yml中集群的一些参数。 然后执行部署脚本，部署脚本中可以先执行2步骤中的前期准备工作，然后再执行：
```
#kolla-ansible -i multinode deploy  
```
剩下的就是等待30分钟左右的时间，一个自己定制的Openstack集群就部署完成了。执行post deploy获取rc文件，可以开始使用自己部署的Openstack集群了。

## 3.3 裸机provision部分
Kolla现在一个小缺憾就是把操作系统部署过程没有cover，感觉也不应该由Kolla来cover。

如果是在虚拟机化环境部署，相对简单一些。比如调用Openstack API或者AWS API创建一堆虚拟机，然后在上边部署Openstack，所有可以串起来自动化完成。

 如果是在裸机上边部署Openstack，就需要和PXE结合，需要自己开发相关PXE部署代码，实现裸机操作系统的部署，实现完全自动化部署。

## 3.4 一些有用的命令
- kolla-ansible -i multinode prechecks 部署集群前，先检查所有节点是否满足部署条件。
- kolla-ansible -i multinode destroy --yes-i-really-really-mean-it 彻底删除所有的容器和卷。通过这个命令可以清理环境，重新创建集群。
- kolla-ansible -i multinode mariadb_recovery 用来恢复mariadb集群。采用galera部署mariadb集群时，如果所有节点同时意外断电，会导致集群重新启动时，不能自动恢复。手动恢复比较麻烦，需要找到inodb中的seqno最大的，主节点进入维护模式，再启动其他节点。集群正常后再重新启动主节点。加上所有服务在容器中，手动恢复过程还是比较复杂。Kolla提供这个命令可以在mariadb集群坏了时，一条命令即可恢复。
- kolla-ansible -i multinode upgrade 一键升级整个集群到新版本
- kolla-ansible -i multinode reconfigure 重新配置所有Openstack 服务
- kolla-ansible -i multinode post-deploy 部署完成后获取rc文件
- kolla-ansible -i multinode check 部署完成后做一个冒烟测试

# 四、结束
Kolla执行裸机部署和Kubernetes两种部署方式， 由于Kubernetes部署方式还在密集开发中，这次没有使用Kubernetes方式安装。



















