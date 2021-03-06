---
layout: post
title:  "OpenStack中的单元测试"
date:   2017-03-20 13：08:09 -0800
categories: unitest
tags: unittest
---

本文将进入单元测试的部分，这也是基础知识中最后一个大块。本文将重点讲述Python和OpenStack中的单元测试的生态环境。

# 单元测试工具
Python的单元测试工具很多，为单元测试提供不同方面的功能。OpenStack的项目也基本把现在流行的单元测试工具都用全了。单元测试可以说是入门OpenStack开发的最难的部分，也是最后一公里。本章，我们就介绍一下在OpenStack中会用到的单元测试的工具。由于数量很多，不可能详细介绍，因此主要做一些概念和用途上的介绍。

## unittest
unittest是Python的标准库，提供了最基本的单元测试功能，包括单元测试运行器（简称runner）和单元测试框架。项目的单元测试代码的测试类可以继承unittest.TestCase类，这样这个类就能够被runner发现并且执行。同时，unittest.TestCase这个类还定义了setUp()，tearDown()，setUpClass()和tearDownClass()方法，是用来运行单元测试前的设置工作代码和单元测试后的清理工作代码，这个也是所有Python代码遵守的规范，所以第三方的单元测试库和框架也都遵循这个规范。

unittest库也提供了一个runner，可以使用$ python -m unittest test_module的命令来执行某个模块的单元测试。另外，在Python中指定要运行的单元测试用例的完整语法是：
```
path.to.your.module:ClassOfYourTest.test_method。
```

unittest是学习Python单元测试最基本也最重要的一个库，完整的说明请查看官方文档：https://docs.python.org/2.7/library/unittest.html。

## mock
mock也是另一个重要的单元测试库，在Python 2中是作为一个第三方库被使用的，到Python 3时，就被纳入了标准库，可见这个库的重要性。简单的说，mock就是用来模拟对象的行为，这样在进行单元测试的时候，可以指定任何对象的返回值，便于测试对外部接口有依赖的代码。关于mock的使用，可以查看我之前写的这篇文章Python Mock的入门

## testtools
testtools是个unittest的扩展框架，主要是在unittest的基础上提供了更好的assert功能，使得写单元测试更加方便。具体可以查看文档：http://testtools.readthedocs.org/en/latest/。

## fixtures
fixture的意思是固定装置，在Python的单元测试中，是指某段可以复用的单元测试setUp和tearDown代码组合。一个fixture一般用来实现某个组件的setUp和tearDown逻辑，比如测试前要先创建好某些数据，测试后要删掉这些数据，这些操作就可以封装到一个fixture中。这样不同的测试用例就不用重复写这些代码，只要使用fixture即可。fixtures模块是一个第三方模块，提供了一种简单的创建fixture类和对象的机制，并且也提供了一些内置的fixture。具体的使用方法可以查看官方文档：https://pypi.python.org/pypi/fixtures/。

## testscenarios
testscenarios模块满足了场景测试的需求。它的基本用法是在测试类中添加一个类属性scenarios，该属性是一个元组，定义了每一种场景下不同的变量的值。比如说你测试一段数据访问代码，你需要测试该代码在使用不同的驱动时，比如MongoDB、SQL、File，是否都能正常工作。我们有三种办法：

- 最笨的办法是为不同的驱动把同一个测试用例编写3遍。
- 比较好的办法是，编写一个统一的非测试用例方法，接收driver作为参数，执行测试逻辑，然后再分别编写三个测试用例方法去调用这个非测试用例方法。
- 更好的办法就是使用testscenarios模块，定义好scenarios变量，然后实现一个测试用例方法。

testscenarios模块在OpenStack Ceilometer中被大量使用。更多的信息可以查看文档：https://pypi.python.org/pypi/testscenarios/

## subunit
subunit是一个用于传输单元测试结果的流协议。一般来说，运行单元测试的时候是把单元测试的结果直接输出到标准输出，但是如果运行大量的测试用例，这些测试结果就很难被分析。因此就可以使用python-subunit模块来运行测试用例，并且把测试用例通过subunit协议输出，这样测试结果就可以被分析工具聚合以及分析。python-subunit模块自带了一些工具用来解析subunit协议，比如你可以这样运行测试用例：
```
$ python -m subunit.run test_module | subunit2pyunit
```
subunit2pyunit命令会解析subunit协议，并且输出到标准输出。关于subunit的更多信息，请查看官方文档：https://pypi.python.org/pypi/python-subunit/。

## testrepository
OpenStack中使用testrepository模块管理单元测试用例。当一个项目中的测试用例很多时，如何更有效的处理单元测试用例的结果就变得很重要。testrepository的出现就是为了解决这个问题。testrepository使用python-subunit模块来运行测试用例，然后分析subunit的输出并对测试结果进行记录（记录到本地文件）。举例来说，testrepository允许你做这样的事情：
 1. 知道哪些用例运行时间最长
 2. 显示运行失败的用例
 3. 重新运行上次运行失败的用例

testrepository的更多信息，请查看官方文档：http://testrepository.readthedocs.org/en/latest/。

## coverage
coverage是用来计算代码运行时的覆盖率的，也就是统计多少代码被执行了。它可以和testrepository一起使用，用来统计单元测试的覆盖率，在运行完单元测试之后，输出覆盖率报告。具体的使用方法可以查看官方文档：http://coverage.readthedocs.org/en/latest/。

## tox
tox是用来管理和构建虚拟环境(virtualenv)的。对于一个项目，我们需要运行Python 2.7的单元测试，也需要运行Python 3.4的单元测试，还需要运行PEP8的代码检查。这些不同的任务需要依赖不同的库，所以需要使用不同的虚拟环境。使用tox的时候，我们会在tox的配置文件tox.ini中指定不同任务的虚拟环境名称，该任务在虚拟环境中需要安装哪些包，以及该任务执行的时候需要运行哪些命令。更多信息，请查看官方文档：https://testrun.org/tox/latest/

##nosetests
nosetests也是一个python的单元测试工具，可以检测和运行测试用例，通过添加 -s参数可以单步调试单元测试。

# 单元测试工具小结
本章介绍了OpenStack中常用的单元测试工具的基本用途，希望大家对这些工具有个大概的认识。这里我们可以按照类别总结一下这些工具：
### 测试环境管理: tox
  使用tox来管理测试运行的虚拟环境，并且调用testrepository来执行测试用例。
### 测试用例的运行和管理: testrepository, subunit, coverage
  testrepository调用subunit来执行测试用例，对测试结果进行聚合和管理；调用coverage来执行代码覆盖率的计算。
### 测试用例的编写: unittest, mock, testtools, fixtures, testscenarios
  使用testtools作为所有测试用例的基类，同时应用mock, fixtures, testscenarios来更好的编写测试用例。
 
# Keystone的单元测试框架
现在，我们以Keystone项目为例，来看下真实项目中的单元测试是如何架构的。我们采用自顶向下的方式，先从最上层的部分介绍起。

## 使用tox进行测试环境管理
大部分情况下，我们都是通过tox命令来执行单元测试的，并且传递环境名称给tox命令：

```
➜ ~/openstack/env/p/keystone git:(master) ✗ $ tox -e py27
```

tox命令首先会读取项目根目录下的tox.ini文件，获取相关的信息，然后根据配置构建virtualenv，保存在.tox/目录下，以环境名称命名：

```
➜ ~/openstack/env/p/keystone git:(master) ✗ $ ls .tox

log  pep8  py27
```

除了log目录，其他的都是普通的virtualenv环境，你可以自己查看一下内容。我们来看下py27这个环境的相关配置（在tox.ini）中，我直接在内容上注释一些配置的用途：

```
[tox]
minversion = 1.6
skipsdist = True
# envlist表示本文件中配置的环境都有哪些
envlist = py34,py27,pep8,docs,genconfig,releasenotes
# testenv是默认配置，如果某个配置在环境专属的section中没有，就从这个section中读取
[testenv]
# usedevelop表示安装virtualenv的时候，本项目自己的代码采用开发模式安装，也就是不会拷贝代码到virtualenv目录中，只是做个链接
usedevelop = True
# install_command表示构建环境的时候要执行的命令，一般是使用pip安装
install_command = pip install -U {opts} {packages}
setenv = VIRTUAL_ENV={envdir}
# deps指定构建环境的时候需要安装的依赖包，这个就是作为pip命令的参数
# keystone这里使用的写法比较特殊一点，第二行的.[ldap,memcache,mongodb]是两个依赖，第一个点'.'表示当前项目的依赖，也就是requirements.txt，第二个部分[ldap,memcache,mongodb]表示extra，是在setup.cfg文件中定义的一个段的名称，该段下定义了额外的依赖，这些可以查看PEP0508
# 一般的项目这里会采用更简单的方式来书写，直接安装两个文件中的依赖：
#    -r{toxinidir}/requirements.txt
#    -r{toxinidir}/test-requirements.txt
deps = -r{toxinidir}/test-requirements.txt
       .[ldap,memcache,mongodb]
# commands表示构建好virtualenv之后要执行的命令，这里调用了tools/pretty_tox.sh来执行测试
commands =
  find keystone -type f -name "*.pyc" -delete
  bash tools/pretty_tox.sh '{posargs}'
whitelist_externals =
  bash
  find
passenv = http_proxy HTTP_PROXY https_proxy HTTPS_PROXY no_proxy NO_PROXY PBR_VERSION
# 这个section是为py34环境定制某些配置的，没有定制的配置，从[testenv]读取
[testenv:py34]
commands =
  find keystone -type f -name "*.pyc" -delete
  bash tools/pretty_tox_py3.sh
```

上面提到的PEP-0508是依赖格式的完整说明。setup.cfg的extra部分如下：

```
[extras]
ldap =
  python-ldap>=2.4:python_version=='2.7' # PSF
  ldappool>=1.0:python_version=='2.7' # MPL
memcache =
  python-memcached>=1.56 # PSF
mongodb =
  pymongo!=3.1,>=3.0.2 # Apache-2.0
bandit =
  bandit>=0.17.3 # Apache-2.0
```

# 使用testrepository管理测试的运行
上面我们看到tox.ini文件中的commands参数中执行的是tools/pretty_tox.sh命令。这个脚本的内容如下：
```
#!/usr/bin/env bash
set -o pipefail
TESTRARGS=$1
# testr和setuptools已经集成，所以可以通过setup.py testr命令来执行
# --testr-args表示传递给testr命令的参数，告诉testr要传递给subunit的参数
# subunit-trace是os-testr包中的命令（os-testr是OpenStack的一个项目），用来解析subunit的输出的。
python setup.py testr --testr-args="--subunit $TESTRARGS" | subunit-trace -f
retval=$?
# NOTE(mtreinish) The pipe above would eat the slowest display from pbr's testr
# wrapper so just manually print the slowest tests.
echo -e "\nSlowest Tests:\n"
# 测试结束后，让testr显示出执行时间最长的那些测试用例
testr slowest
exit $retval
```

tox就是从tools/pretty_tox.sh这个命令开始调用testr来执行单元测试的。testr本身的配置是放在项目根目录下的.testr.conf文件：
```
[DEFAULT]
test_command=
    ${PYTHON:-python} -m subunit.run discover -t ./ ${OS_TEST_PATH:-./keystone/tests/unit} $LISTOPT $IDOPTION
test_id_option=--load-list $IDFILE
test_list_option=--list
group_regex=.*(test_cert_setup)
# NOTE(morganfainberg): If single-worker mode is wanted (e.g. for live tests)
# the environment variable ``TEST_RUN_CONCURRENCY`` should be set to ``1``. If
# a non-default (1 worker per available core) concurrency is desired, set
# environment variable ``TEST_RUN_CONCURRENCY`` to the desired number of
# workers.
test_run_concurrency=echo ${TEST_RUN_CONCURRENCY:-0}
```

这个文件中的配置项可以从testr官方文档中找到。其中test_command命令表示要执行什么命令来运行测试用例，这里使用的是subunit.run，这个我们在上面提到过了。
到目前为止的流程就是：
 1. tox建好virtualenv
 2. tox调用testr
 3. testr调用subunit来执行测试用例

每个OpenStack项目基本上也都是这样。如果你自己在开发一个Python项目，你也可以参考这个架构。

# 单元测试用例的代码架构
下面我们来看一下Keystone的单元测试代码是如何写的，主要是看一下其层次结构。每个OpenStack项目的单元测试代码结构可能都不一样，不过你了解完Keystone的结构之后，看其他项目的就会比较快了。

我们以一个测试类为例来分析测试代码的结构：keystone.tests.unit.test_v3_assignment:AssignmentTestCase。下面是这个类的继承结构，同一级别的缩进表示多重继承，增加缩进表示父类，这里删掉了不必要的路径前缀（从unit目录开始），如下所示：
```
# 这个测试类是测RoleAssignment的API的
unit.test_v3_assignment.RoleAssignmentBaseTestCase
-> unit.test_v3.AssignmentTestMixin  这个类包含了一下测试Assignment的工具函数
-> unit.test_v3.RestfulTestCase      这个类是进行V3 REST API测试的基类，实现了V3 API的请求发起和校验
  -> unit.core.SQLDriverOverride     用于修改各个配置的driver字段为sql
  -> unit.test_v3.AuthTestMixin      包含创建认证请求的辅助函数
  -> unit.rest.RestfulTestCase       这个类是进行RESP API测试的基类，V2和V3的API测试都是以这个类为基类，这个类的setUp方法会初始化数据库，创建好TestApp。
    -> unit.TestCase                 这个类是Keystone中所有单元测试类的基类，它主要初始化配置，以及初始化log
      -> unit.BaseTestCase           这个类主要是配置测试运行的基本环境，修改一些环境变量，比如HOME等。
        -> oslotest.BaseTestCase     这个是在oslotest中定义的基类，原来所有的OpenStack项目的单元测试都继承自这个基类。
                                     不过，这个继承在Keystone中已经被删除了，Keystone自己在unit.BaseTestCase中做了差不多的事情。
                                     这个是2016-02-17做的变更，具体的可以查看这个revision 262d0b66c3bcb82eadb663910ee21ded63e77a78。
          -> testtools.TestCase      使用testtools作为测试框架
            -> unittest.TestCase     testtools本身是unittest的扩展
```

从上面的层次结构可以看出，OpenStack中的大项目，由于单元测试用例很多（Keystone现在有超过6200个单元测试用例），所以其单元测试架构也会比较复杂。要写好单元测试，需要先了解一下整个测试代码的架构。