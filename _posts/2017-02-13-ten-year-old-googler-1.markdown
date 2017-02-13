---
layout: post
title:  "google 10年工程师谈软件法开发"
date:   2017-02-11 19:24:09 -0800
categories: Life
tags: Life
---
 
Abstract
===

We catalog and describe Google’s key software engineering practices.

Biography
===

Fergus Henderson has been a software engineer at Google for over 10 years. He started programming as a kid in 1979, and went on to academic research in programming language design and implementation. With his PhD supervisor, he co-founded a research group at the University of Melbourne that developed the programming language Mercury. He has been a program committee member for eight international conferences, and has released over 500,000 lines of open-source code. He was a former moderator of the Usenet newsgroup comp.std.c++ and was an officially accredited “Technical Expert” to the ISO C and C++ committees. He has over 15 years of commercial software industry experience. At Google, he was one of the original developers of Blaze, a build tool now used across Google, and worked on the server-side software behind speech recognition and voice actions (before Siri!) and speech synthesis. He currently manages Google's text-to-speech engineering team, but still writes and reviews plenty of code. Software that he has written is installed on over a billion devices, and gets used over a billion times per day.


Contents
===
1. Introduction
2. Software development
 - 2.1. The Source Repository
 - 2.2. The Build System
 - 2.3. Code Review
 - 2.4. Testing
 - 2.5. Bug tracking
 - 2.6. Programming languages
 - 2.7. Debugging and Profiling tools 
 - 2.8. Release engineering
 - 2.9. Launch approval
 - 2.10. Post-mortems
 - 2.11. Frequent rewrites
3. Project management 
 - 3.1. 20% time
 - 3.2. Objectives and Key Results (OKRs) 
 - 3.3 Project approval
 - 3.4 Corporate reorganizations
4. People management 
 - 4.1. Roles
 - 4.2. Facilities
 - 4.3. Training
 - 4.4 Transfers
 - 4.5. Performance appraisal and rewards
5. Conclusions 
Acknowledgements 
References

[toc]

# 1. Introduction

Google has been a phenomenally successful company. As well as the success of Google Search and AdWords, Google has delivered many other stand-out products, including Google Maps, Google News, Google Translate, Google speech recognition, Chrome, and Android. Google has also greatly enhanced and scaled many products that were acquired by purchasing smaller companies, such as YouTube, and has made significant contributions to a wide variety ofopen-sourceprojects. And Google has demonstrated some amazing products that are yet to launch, such as self-driving cars.

There are many reasons for Google’s success, including enlightened leadership, great people, a high hiring bar, and the financial strength that comes from successfully taking advantage of an early lead in a very rapidly growing market. But one of these reasons is that Google has developed excellent software engineering practices, which have helped it to succeed. These practices have evolved over time based on the accumulated and distilled wisdom of many of the most talented software engineers on the planet. We would like to share knowledge of our practices with the world, and to share some of the lessons that we have learned from our mistakes along the way.

The aim of this paper is to catalogue and briefly describe Google’s key software engineering practices. Other organizations and individuals can then compare and contrast these with their own software engineering practices, and consider whether to apply some of these practices themselves.

Many authors (e.g. [9], [10], [11]) have written books or articles analyzing Google’s success and history. But most of those have dealt mainly with business, management, and culture; only a fraction of those (e.g. [1, 2, 3, 4, 5, 6, 7, 13, 14, 16, 21]) have explored the software engineering side of things, and most explore only a single aspect; and none of them provide a brief written overview of software engineering practices at Google as a whole, as this paper aims to do.

# 2. Software development

## 2.1. The Source Repository

Most of Google’s code is stored in a single unified source-code repository, and is accessible to all software engineers at Google. There are some notable exceptions, particularly the two large open-source projects Chrome and Android, which use separate open-source repositories, and some high-value or security-critical pieces of code for which read access is locked down more tightly. But most Google projects share the same repository. As of January 2015, this 86 terabyte repository contained a billion files, including over 9 million source code files containing a total of 2 billion lines of source code, with a history of 35 million commits and a change rate of 40 thousand commits per work day [18]. Write access to the repository is controlled: only the listed owners of each subtree of the repository can approve changes to that subtree. But generally any engineer can access any piece of code, can check it out and build it, can make local modifications, can test them, and can send changes for review by the code owners, and if an owner approves, can check in (commit) those changes. Culturally, engineers are encouraged to fix anything that they see is broken and know how to fix, regardless of project boundaries. This empowers engineers and leads to higher-quality infrastructure that better meets the needs of those using it.

Almost all development occurs at the “head” of the repository, not on branches. This helps identify integration problems early and minimizes the amount of merging work needed. It also makes it much easier and faster to push out security fixes.

Automated systems run tests frequently, often after every change to any file in the transitive dependencies of the test, although this is not always feasible. These systems automatically notify the author and reviewers of any change for which the tests failed, typically within a few minutes. Most teams make the current status of their build very conspicuous by installing prominent displays or even sculptures with color-coded lights (green for building successfully and all tests passing, red for some tests failing, black for broken build). This helps to focus engineers’ attention on keeping the build green. Most larger teams also have a “build cop” who is responsible for ensuring that the tests continue to pass at head, by working with the authors of the offending changes to quickly fix any problems or to roll back the offending change. (The build cop role is typically rotated among the team or among its more experienced members.) This focus on keeping the build green makes development at head practical, even for very large teams.

Code ownership. Each subtree of the repository can have a file listing the user ids of the “owners” of that subtree. Subdirectories also inherit owners from their parent directories, although that can be optionally suppressed. The owners of each subtree control write access to that subtree, as described in the code review section below. Each subtree is required to have at least two owners, although typically there are more, especially in geographically distributed teams. It is common for the whole team to be listed in the owners file. Changes to a subtree can be made by anyone at Google, not just the owners, but must be approved by an owner. This ensures that every change is reviewed by an engineer who understands the software being modified.

For more on the source code repository at Google, see [17, 18, 21]; and for how another large company deals with the same challenge, see [19].

## 2.2. The Build System

Google uses a distributed build system known as Blaze, which is responsible for compiling and linking software and for running tests. It provides standard commands for building and testing software that work across the whole repository. These standard commands and the highly optimized implementation mean that it is typically very simple and quick for any Google engineer to build and test any software in the repository. This consistency is a key enabler which helps to make it practical for engineers to make changes across project boundaries.

Programmers write “BUILD” files that Blaze uses to determine how to build their software.
Build entities such as libraries, programs, and tests are declared using fairly high-level declarative build specifications that specify, for each entity, its name, its source files, and the libraries or other build entities that it depends on. These build specifications are comprised of declarations called “build rules” that each specify high-level concepts like “here is a C++ library with these source files which depends on these other libraries”, and it is up to the build system to map each build rule to a set of build steps, e.g. steps for compiling each source file and steps for linking, and for determining which compiler and compilation flags to use.

In some cases, notably Go programs, build files can be generated (and updated) automatically, since the dependency information in the BUILD files is (often) an abstraction of the dependency information in the source files. But they are nevertheless checked in to the repository. This ensures that the build system can quickly determine dependencies by analyzing only the build files rather than the source files, and it avoids excessive coupling between the build system and compilers or analysis tools for the many different programming languages supported.

The build system’s implementation uses Google’s distributed computing infrastructure. The work of each build is typically distributed across hundreds or even thousands of machines. This makes it possible to build extremely large programs quickly or to run thousands of tests in parallel.

Individual build steps must be “hermetic”: they depend only on their declared inputs.
Enforcing that all dependencies be correctly declared is a consequence of distributing the build: only the declared inputs are sent to the machine on which the build step is run. As a result the build system can be relied on to know the true dependencies. Even the compilers that the build system invokes are treated as inputs.

Individual build steps are deterministic. As a consequence, the build system can cache build results. Software engineers can sync their workspace back to an old change number and can rebuild and will get exactly the same binary. Furthermore, this cache can be safely shared between different users. (To make this work properly, we had to eliminate non-determinism in the tools invoked by the build, for example by scrubbing out timestamps in the generated output files.)

The build system is reliable. The build system tracks dependencies on changes to the build rules themselves, and knows to rebuild targets if the action to produce them changed, even if the inputs to that action didn’t, for example when only the compiler options changed. It also deals properly with interrupting the build part way, or modifying source files during the build: in such cases, you need only rerun the build command. There is never any need to run the equivalent of “make clean”.

Build results are cached “in the cloud”. This includes intermediate results. If another build request needs the same results, the build system will automatically reuse them rather than rebuilding, even if the request comes from a different user.

Incremental rebuilds are fast. The build system stays resident in memory so that for rebuilds it can incrementally analyze just the files that have changed since the last build.

Presubmit checks. Google has tools for automatically running as uite of tests when initiating a code review and/or preparing to commit a change to the repository. Each subtree of the repository can contain a configuration file which determines which tests to run, and whether to run them at code review time, or immediately before submitting, or both. The tests can be either synchronous, i.e. run before sending the change for review and/or before committing the change to the repository (good for fast-running tests); or asynchronous, with the results emailed to the review discussion thread. ***The review thread is the email thread on which the code review takes place; all the information in that thread is also displayed in the web-based code review tool.***

## 2.3. Code Review

Google has built excellent web-based code review tools, integrated with email, that allow authors to request a review, and allows reviewers to view side-by-side diffs (with nice color coding) and comment on them. When the author of a change initiates a code review, the reviewers are notified by e-mail, with a link to the web review tool’s page for that change. Email notifications are sent when reviewers submit their review comments. In addition, automated tools can send notifications, containing for example the results of automated tests or the findings of static analysis tools.

All changes to the main source code repository MUST be reviewed by at least one other engineer. In addition, if the author of a change is not one of the owners of the files being modified, then at least one of the owners must review and approve the change.

In exceptional cases, an owner of a subtree can check in (commit) an urgent change to that subtree before it is reviewed, but a reviewer must still be named, and the change author and reviewer will get automatically nagged about it until the change has been reviewed and approved. In such cases, any modifications needed to address review comments must be done in a separate change, since the original change will have already been committed.

Google has tools for automatically suggesting reviewer(s) for a given change, by looking at the ownership and authorship of the code being modified, the history of recent reviewers, and the number of pending code reviews for each potential reviewer. At least one of the owners of each subtree which a change affects must review and approve that change. But apart from that, the author is free to choose reviewer(s) as they see fit.

One potential issue with code review is that if the reviewers are too slow to respond or are overly reluctant to approve changes, this could potentially slow down development. The fact that the code author chooses their reviewers helps avoid such problems, allowing engineers to avoid reviewers that might be overly possessive about their code, or to send reviews for simple changes to less thorough reviewers and to send reviews for more complex changes to more experienced reviewers or to several reviewers.

Code review discussions for each project are automatically copied to a mailing list designated by the project maintainers. Anyone is free to comment on any change, regardless of whether they were named as a reviewer of that change, both before and after the change is committed. If a bug is discovered, it’s common to track down the change that introduced it and to comment on the original code review thread to point out the mistake so that the original author and reviewers are aware of it.

It is also possible to send code reviews to several reviewers and then to commit the change as soon as one of them has approved (provided either the author or the first responding reviewer is an owner, of course), before the other reviewers have commented, with any subsequent review comments being dealt with in follow-up changes. This can reduce the turnaround time for reviews.

In addition to the main section of the repository, there is an “experimental” section of the repository where the normal code review requirements are not enforced. However, code running in production must be in the main section of the repository, and engineers are very strongly encouraged to develop code in the main section of the repository, rather than developing in experimental and then moving it to the main section, since code review is most effective when done as the code is developed rather than afterwards. In practice engineers often request code reviews even for code in experimental.

Engineers are encouraged to keep each individual change small, with larger changes preferably broken into a series of smaller changes that a reviewer can easily review in one go. This also makes it easier for the author to respond to major changes suggested during the review of each piece; very large changes are often too rigid and resist reviewer-suggested changes. One way in which keeping changes small is encouraged1 is that the code review tools label each code review with a description of the size of the change, with changes of 30-99 lines added/deleted/removed being labelled “medium-size” and with changes of above 300 lines being labelled with increasingly disparaging labels, e.g. “large” (300-999), “freakin huge” (1000-1999), etc. (However, in a typically Googly way, this is kept fun by replacing these familiar descriptions with amusing alternatives on a few days each year, such as talk-like-a-pirate day. :)