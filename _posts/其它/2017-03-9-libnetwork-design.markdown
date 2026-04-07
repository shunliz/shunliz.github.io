---
layout: post
title:  "libnetwork设计思想"
date:   2017-03-09 10:42:09 -0800
categories: Docker network
tags: Docker network
---

![libnetwork](https://github.com/docker/libnetwork/blob/master/docs/cnm-model.jpg?raw=true)

libnetwork实现了一个叫做Container Network Model (CNM)的东西，也就是说起希望成为容器的标准网络模型、框架。其包含了下面几个概念：

* Sandbox。对于Sandbox大家就认为是一个namespace即可。联系我们前面Kubernetes中说的Pod，Sandbox其实就是传统意义上的虚拟机的意思。
* Endpoint。Neutron中和Endpoint相对的概念我想应该是VNIC，也就是虚拟机的虚拟网卡（也可以看成是VIF）。当Sandbox要和外界通信的时候就是通过Endpoint连接到外界的，最简单的情况就是连接到一个Bridge上。
* Network。libnetwork中的Network大家就认为是Neutron中的network即可，更加贴切点的话可以认为是Neutron中的一个拥有一个subnet的network。

上面这三个概念就是libnetwork的CNM的核心概念，熟悉了Neutron后并不会对这几个概念在理解上有多大问题。下面我们看下libnetwork为了对外提供这几个概念而暴露的编程结构体：

* NetworkController。用于获取一个控制器，可以认为通过这个控制器可以对接下来的所有网络操作进行操作。Neutron中并没有这么一个概念，因为Neutron中的网络是由agent通过轮询或者消息的方式来间接操作的，而不是由用户使用docker命令直接在本机进行操作。
* Driver。这里的Driver类似于Neutron中的core_plugin或者是ml2下的各种driver，表示的是底层网络的实现方法。比如有bridge的driver，也有基于vxlan的overlay的driver等等。这个概念和Neutron中的driver概念基本上是一样的。
* Network。这里的Network结构体就是对应的上面CNM中的Network，表示建立了一个网络。通过这个结构体可以对建立的网络进行操作。
* Endpoint。这里的Endpoint结构体就是对应上面CNM中的Endpoint，表示建立了一个VNIC或者是VIF。通过这个结构体可以对Endpoint进行操作。
* Sandbox。这里的Sandbox结构体就是对应上面CNM中的Sandbox，表示建立了一个独立的名字空间。可以类比Nova的虚拟机或者是Kubernetes的Pod，亦或是独立的Docker容器。

接着我们看下一般使用libnetwork的方法，具体的步骤一般是下面这样的：

1. 获取一个NetworkController对象用于进行下面的操作。获取对象的时候指定Driver。
2. 通过NetworkController对象的NewNetwork()建立一个网络。这里最简单的理解就是现在我们有了一个bridge了。
3. 通过网络的CreateEndpoint()在这个网络上建立Endpoint。这里最简单的理解就是每建立一个Endpoint，我们上面建立的bridge上就会多出一个VIF口等着虚拟机或者Sandbox连上来。假设这里使用的是veth，则veth的一头目前接在了bridge中，另一头还暴露在外面。
4. 调用上面建立的Endpoint的Join方法，提供容器信息，于是libnetwork的代码就会建立一个Sandbox对象（一般这里的Sandbox就是容器的namespace，所以不会重复建立），然后将第三步建立的veth的一头接入到这个Sandbox中，也就是将其放到Sandbox的namespace中。
5. 当Sandbox的生命周期结束时，调用Endpoint的Leave方法使其从这个Network中解绑。简单的说就是将veth从Sandbox的namespace中拿出来回到物理机上。
6. 如果一个Endpoint无用了，则可以调用Delete方法删除。
7. 如果一个Network无用了，则可以调用Delete方法删除。


