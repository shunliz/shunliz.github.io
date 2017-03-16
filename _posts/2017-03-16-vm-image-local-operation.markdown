---
layout: post
title:  "在宿主机挂载客户机虚拟磁盘文件"
date:   2017-03-16 19:42:09 -0800
categories: virtualization
tags: virtualization libguestfs
---

# 前言
有时候，我们需要向客户机复制文件，或者把文件复制出客户机磁盘。那么，我们就需要操作客户机磁盘。当然，如果客户机能够很好的识别并挂载宿主机上的移动设备，那就不需要本文档了。然而，笔者所处的环境并不是这样。
无论如何，学习一种更为有效的方法总不是件坏事。那么，就跟随笔者的文字，学习一下挂载虚拟机磁盘的方法吧。
啰嗦一句，如果笔者的文档有不够完善，有错别字，内容有误等情况。并且不幸造成您的损失。笔者表示万分歉意。因为笔者不是万能的，请批判地学习本文档！

# 理论描述
Linux KVM支持多种虚拟磁盘类型。其中比较典型的是raw和qcow2。至于他们之间的区别，请自己寻找相关文档。笔者不做过多解释。
对于raw型的磁盘。因为使用的是裸设备形式的读写，没有采用任何形式的压缩。所以您可以使用losetup命令直接把raw形式的磁盘文件生成一个loop设备。使用kpartx 命令读取分区，并作相应映射。即可直接挂载客户机文件系统。
对于qcow2或其他非raw格式的客户机磁盘。需要使用一个KVM提供的一个命令/usr/bin/guestmount来挂载客户机磁盘。这条命令在CentOS发行版中，可以通过安装软件包libguestfs和libguestfs-tools来获取。
请根据实际情况，来使用不同的方法。
# 操作步骤
## Raw格式客户机磁盘

Raw格式的客户机磁盘，由于不需要其他工具包。操作比较简单，下面是操作步骤：

### 正向操作

关联客户机磁盘文件到宿主机loop1设备

```
[root@manager kvm]# losetup /dev/loop1 /home/kvm/linux-test.img
```

读取并映射与客户机磁盘关联的loop1设备的分区信息

[root@manager kvm]# kpartx -a /dev/loop1

查看映射后的分区信息，可以看出有客户机磁盘共2个分区

[root@manager kvm]# ls /dev/mapper/loop1p1  loop1p2 （输出节选）

挂载客户机磁盘第一个分区到宿主机目录树中。这里根据客户机文件系统的不同，需要添加不同的参数草mount命令中。例如，如果需要挂载的客户机操作系统为NTFS，那么需要在宿主机中，下载并安装ntfs-3g_ntfsprogs软件包的源代码，并编译安装。才能让宿主即识别客户机的文件系统。

[root@manager kvm]# mount /dev/mapper/loop1p1 /mnt/adisk/ 

列出客户机磁盘第一分区文件信息

[root@manager kvm]# ls /mnt/adisk/ 

config-2.6.32-279.el6.x86_64  lost+found  efi  symvers-2.6.32-279.el6.x86_64.gz  grub System.map-2.6.32-279.el6.x86_64  initramfs-2.6.32-279.el6.x86_64.img  （输出节选）

以上是普通分区的操作过程，如果您操作的是LVM磁盘卷组。那么直接挂载分区是不行的，因为Linux不识别LVM的PV。您无法直接挂载LVM的卷组。这里操作流程如下：
关联客户机磁盘文件到宿主机loop1设备

 [root@manager kvm]# losetup /dev/loop1 /home/kvm/linux-test.img
 
读取并映射与客户机磁盘关联的loop1设备的分区信息

 [root@manager kvm]# kpartx -a /dev/loop1
 
查看映射后的分区信息，可以看出有客户机磁盘共2个分区

[root@manager kvm]# ls /dev/mapper/  loop1p1  loop1p2 （输出节选）


扫描系统卷组。

```
[root@manager kvm]# vgscan
  Reading all physical volumes.  
  This may take a while...  
  Found volume group "VolGroup" using metadata type lvm2  
  Found volume group "vg_manager" using metadata type lvm2
```

激活所有添加到系统中的（已知的和未知的）卷组

[root@manager kvm]# vgchange –ay  2 

logical volume(s) in volume group "VolGroup" now active  2 logical volume(s) in volume group "vg_manager" now active

查看卷组是否已经添加到系统中

[root@manager kvm]# ls /dev/ | grep VolGroup  VolGroup

查看卷组包含的逻辑卷信息

[root@manager kvm]# ls /dev/VolGroup lv_root  lv_swap

挂载逻辑卷到宿主机系统目录树中

[root@manager kvm]# mount /dev/VolGroup/lv_root /mnt/bdisk/

查看客户机目录树

[root@manager kvm]# ls /mnt/bdisk/ 

bin   cgroup  etc   lib    lost+found  mnt  proc  sbin     srv  tmp  var boot  dev     home  lib64  media       opt  root  selinux  sys  usr

## 反向操作

知道如何挂载客户机磁盘，必须还得知道如何安全的解挂客户机磁盘。否则，会造成客户机文件系统的损坏，造成不必要的麻烦。下面是安全解挂客户机磁盘的步骤。
要明确没有运行在客户机磁盘在宿主机挂载点内的程序，没有shell的工作目录处于客户机磁盘在宿主机上的挂载点内。
由于在笔者演示环境下，客户机磁盘有两个分区，一个磁盘分区vda1为/boot，另一个磁盘分区vda2为PV上面承载卷组VolGroup。所以，反操作部分笔者合到一起讲述了。相信您能看得懂。
解挂所有挂载的客户机文件系统

[root@manager kvm]# umount /mnt/adisk/[root@manager kvm]# umount /mnt/bdisk/

去除添加到宿主机系统中的客户机卷组

[root@manager kvm]# vgchange -an VolGroup   

0 logical volume(s) in volume group "VolGroup" now active

查看并确认客户机卷组已经从宿主机中去除

[root@manager kvm]# ls /dev/ | grep VolGroup

从宿主机系统中，去除客户机磁盘所关联的loop设备的分区映射

[root@manager kvm]# kpartx -d /dev/loop1

去除客户机磁盘和宿主机loop设备的关联

[root@manager kvm]# losetup -d /dev/loop1

## 补充说明

这里需要说明以下几点问题，

这种挂载方式，客户机的文件（或目录）所属用户的UID，如果在宿主机有使用同样UID的用户，那么宿主机中的相应用户就获取了客户机中用户对应其文件的相应权限。所以，操作具有一定风险性。最好在客户机关机的情况下进行。

去除客户机磁盘之前，一定要确保所有文件系统被解挂，有关卷组已经从宿主机系统中去除，分区映射信息已经从宿主机内核中去除。否则，可能会造成不可预测的问题（笔者没试，有余力这可以尝试一下）。

## 所有格式客户机磁盘

在宿主机中，挂载非Raw格式的客户机磁盘需要使用软件包libguestfs和libguestfs-tools。使用如下命令查看系统中是否安装相应软件包。

[root@manager kvm]# rpm -q libguestfs

libguestfs-1.16.19-1.el6.x86_64

[root@manager kvm]# rpm -q libguestfs-tools

libguestfs-tools-1.16.19-1.el6.x86_64

如果你的输出结果如上，说明已经安装相应软件包。否则执行如下命令安装相应软件包。
[root@manager kvm]# yum install libguestfs libguestfs-tools -y

## 正向操作

对于第一个分区使用简单磁盘作为/boot分区，第二个分区使用LVM逻辑卷的典型Linux系统。执行如下命令：

guestmount -a /home/kvm/guest.img -m /dev/VolGroup /lv_root -m /dev/sda1:/boot --rw /mnt/cdisk/

命令解释：-a参数指定虚拟磁盘，-d参数指定虚拟实例名，即在虚拟机管理器中显示的名称；-m参数指定要挂载的设备在客户机中的挂载点，如果指定错误，会有错误输出，然后给出正确的挂载点；–rw表示以读写的形式挂载到宿主机中，–ro理所当然的表示以只读的形式挂载；最后给出在宿主机中的挂载点。
如果不知道客户机中磁盘设备的包含的文件系统，可以使用virt-filesystems命令检测也可以让guestmount命令加上参数 -i 自己检测。命令如下：
Virt-filesystems 加参数-a 检测一个客户机磁盘文件，加参数-d检测一个客户机使用的磁盘文件，加参数–parts 检测客户机的磁盘分区信息，此时不包括LVM信息。

virt-filesystems -a /home/kvm/guest.imgvirt-filesystems -d MyGuestNamevirt-filesystems -d MyGuestName --parts

guestmount加参数-i 自动检测客户机磁盘文件，并挂载。但结果不一定都是想要的。

guestmount -a guest.img -i --rw /mnt/cdisk

对于一个在第一个分区包含主要文件系统的windows分区，执行如下命令挂载。

guestmount -a windows.img -m /dev/sda1 --rw /mnt/cdisk

这里需要注意的是，如果windows使用的是NTFS分区，则需要预先安装ntfs-3g软件包，获取ntfs文件系统的支持。

## 反向操作

使用umount命令解挂即可，命令如下：

umount /mnt/cdisk

## 结语
本文档讲解了Linux-KVM虚拟化环境下，在宿主机挂载客户机磁盘的两种方法。挂载raw格式的宿主机磁盘可以使用losetup或guestmount两种方法。挂载其他格式的宿主机磁盘则只能使用guestmount方法来挂载。
通过以上描述我们可以看出，使用guestmount命令可以很容易的解决挂载客户机磁盘文件系统的问题。并且使用guestmount命令不需要root权限，只要用户拥有访问虚拟客户机和使用宿主机挂载点的权限，就可以使用guestmount命令。
推荐使用guestmount命令！

