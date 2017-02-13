---
layout: post
title:  "10年老员工谈Google的软件工程实践（二）"
date:   2017-02-13 16:01:09 -0800
categories: software-engineering
tags: software-engineering
---
 
## 2.4. Testing

Unit Testing is strongly encouraged and widely practiced at Google. All code used in production is expected to have unit tests, and the code review tool will highlight if source files are added without corresponding tests. Code reviewers usually require that any change which adds new functionality should also add new tests to cover the new functionality. Mocking frameworks ***which allow construction of lightweight unit tests even for code with dependencies on heavyweight libraries*** are quite popular.

Integration testing and regression testing are also widely practiced.

As discussed in "Presubmit Checks" above, testing can be automatically enforced as part of the code review and commit process.

Google also has automated tools for measuring test coverage. The results are also integrated as an optional layer in the source code browser.

Load testing prior to deployment is also de rigueur at Google. Teams are expected to produce a table or graph showing how key metrics, particularly latency and error rate, vary with the rate of incoming requests.

## 2.5. Bug tracking

Google uses a bug tracking system called Buganizer for tracking issues: bugs, feature requests, customer issues, and processes ***such as releases or clean-up efforts***. Bugs are categorized into hierarchical components and each component can have a default assignee and default email list to CC. When sending a source change for review, engineers are prompted to associate the change with a particular issue number.

It is common (though not universal) for teams at Google to regularly scan through open issues in their component(s), prioritizing them and where appropriate assigning them to particular engineers. Some teams have a particular individual responsible for bug triage, others do bug triage in their regular team meetings. Many teams at Google make use of labels on bugs to indicate whether bugs have been triaged, and which release(s) each bug is targeted to be fixed in.

## 2.6. Programming languages

Software engineers at Google are strongly encouraged to program in one of four officially-approved programming languages at Google: C++, Java, Python, or Go. Minimizing the number of different programming languages used reduces obstacles to code reuse and programmer collaboration.

There are also Google style guides for each language, to ensure that code all across the company is written with similar style, layout, naming conventions, etc. In addition there is a company-wide readability training process, whereby experienced engineers who care about code readability train other engineers in how to write readable, idiomatic code in a particular language, by reviewing a substantial change or series of changes until the reviewer is satisfied that the author knows how to write readable code in that language. Each change that adds non-trivial new code in a particular language must be approved by someone who has passed this “readability” training process in that language.

In addition to these four languages, many specialized domain-specific languages are used for particular purposes (e.g. the build language used for specifying build targets and their dependencies).

Interoperation between these different programming languages is done mainly using Protocol Buffers. Protocol Buffers is a way of encoding structured data in an efficient yet extensible way. It includes a domain-specific language for specifying structured data, together with a compiler that takes in such descriptions and generates code in C++, Java, Python, for constructing, accessing, serializing, and deserializing these objects. Google’s version of Protocol Buffers is integrated with Google’s RPC libraries, enabling simple cross-language RPCs, with serialization and deserialization of requests and responses handled automatically by the RPC framework.

Commonality of process is a key to making development easy even with an enormous code base and a diversity of languages: there is a single set of commands to perform all the usual software engineering tasks (such as check out, edit, build, test, review, commit, file bug report, etc.) and the same commands can be used no matter what project or language. Developers don’t need to learn a new development process just because the code that they are editing happens to be part of a different project or written in a different language.

## 2.7. Debugging and Profiling tools

Google servers are linked with libraries that provide a number of tools for debugging running servers. In case of a server crash, a signal handler will automatically dump a stack trace to a log file, as well as saving the core file. If the crash was due to running out of heap memory, the server will dump stack traces of the allocation sites of a sampled subset of the live heap objects. There are also web interfaces for debugging that allow examining incoming and outgoing RPCs (including timing, error rates, rate limiting, etc.), changing command-line flag values (e.g. to increase logging verbosity for a particular module), resource consumption, profiling, and more.

These tools greatly increase the overall ease of debugging to the point where it is rare to fire up a traditional debugger such as gdb.

## 2.8. Release engineering

A few teams have dedicated release engineers, but for most teams at Google, the release engineering work is done by regular software engineers.

Releases are done frequently for most software; weekly or fortnightly releases are a common goal, and some teams even release daily. This is made possible by automating most of the normal release engineering tasks. Releasing frequently helps to keep engineers motivated (it’s harder to get excited about something if it won’t be released until many months or even years into the future) and increases overall velocity by allowing more iterations, and thus more opportunities for feedback and more chances to respond to feedback, in a given time.

A release typically starts in a fresh workspace, by syncing to the change number of the latest “green” build (i.e. the last change for which all the automatic tests passed), and making a release branch. The release engineer can select additional changes to be “cherry-picked”, i.e. merged from the main branch onto the release branch. Then the software will be rebuilt from scratch and the tests are run. If any tests fail, additional changes are made to fix the failures and those additional changes are cherry-picked onto the release branch, after which the software will be rebuilt and the tests rerun. When the tests all pass,the built executable(s) and data file(s) are packaged up. All of these steps are automated so that the release engineer need only run some simple commands, or even just select some entries on a menu-driven UI, and choose which changes (if any) to cherry pick.

Once a candidate build has been packaged up, it is typically loaded onto a “staging” server for further integration testing by small set of users (sometimes just the development team).

A useful technique involves sending a copy of (a subset of) the requests from production traffic to the staging server, but also sending those same requests to the current production servers for actual processing. The responses from the staging server are discarded, and the responses from the live production servers are sent back to the users. This helps ensure that any issues that might cause serious problems (e.g. server crashes) can be detected before putting the server into production.

The next step is to usually roll out to one or more “canary” servers that are processing a subset of the live production traffic. Unlike the “staging” servers, these are processing and responding to real users.

Finally the release can be rolled out to all servers in all data centers. For very high-traffic, high-reliability services, this is done with a gradual roll-out over a period of a couple of days, to help reduce the impact of any outages due to newly introduced bugs not caught by any of the previous steps.

For more information on release engineering at Google, see chapter 8 of the SRE book [7]. See also [15].

## 2.9. Launch approval

The launch of any user-visible change or significant design change requires approvals from a number of people outside of the core engineering team that implements the change. In particular approvals (often subject to detailed review) are required to ensure that code complies with legal requirements, privacy requirements, security requirements, reliability requirements (e.g. having appropriate automatic monitoring to detect server outages and automatically notify the appropriate engineers), business requirements, and so forth.

The launch process is also designed to ensure that appropriate people within the company are notified whenever any significant new product or feature launches.

Google has an internal launch approval tool that is used to track the required reviews and approvals and ensure compliance with the defined launch processes for each product. This tool is easily customizable, so that different products or product areas can have different sets of required reviews and approvals.

For more information about launch processes, see chapter 27 of the SRE book [7].

## 2.10. Post-mortems

Whenever there is a significant outage of any of our production systems, or similar mishap, the people involved are required to write a post-mortem document. This document describes the incident, including title, summary, impact, timeline, root cause(s), what worked/what didn’t, and action items. The focus is on the problems, and how to avoid them in future, not on the people or apportioning blame. The impact section tries to quantify the effect of the incident, in terms of duration of outage, number of lost queries (or failed RPCs, etc.), and revenue. The timeline section gives a timeline of the events leading up to the outage and the steps taken to diagnose and rectify it. The what worked/what didn’t section describes the lessons learnt -- which practices helped to quickly detect and resolve the issue, what went wrong, and what concrete actions (preferably filed as bugs assigned to specific people) can be take to reduce the likelihood and/or severity of similar problems in future.

For more information on post-mortem culture at Google, see chapter 15 of the SRE book [7].

## 2.11. Frequent rewrites

Most software at Google gets rewritten every few years.

This may seem incredibly costly. Indeed, it does consume a large fraction of Google’s resources. However, it also has some crucial benefits that are key to Google’s agility and long-term success. In a period of a few years, it is typical for the requirements for a product to change significantly, as the software environment and other technology around it change, and as changes in technology or in the marketplace affect user needs, desires, and expectations. Software that is a few years old was designed around an older set of requirements and is typically not designed in a way that is optimal for current requirements. Furthermore, it has typically accumulated a lot of complexity. Rewriting code cuts away all the unnecessary accumulated complexity that was addressing requirements which are no longer so important. In addition, rewriting code is a way of transferring knowledge and a sense of ownership to newer team members. This sense of ownership is crucial for productivity: engineers naturally put more effort into developing features and fixing problems in code that they feel is “theirs”. Frequent rewrites also encourage mobility of engineers between different projects which helps to encourage cross-pollination of ideas. Frequent rewrites also help to ensure that code is written using modern technology and methodology.

# 3. Project management

## 3.1. 20% time

Engineers are permitted to spend up to 20% of their time working on any project of their choice, without needing approval from their manager or anyone else. This trust in engineers is extremely valuable, for several reasons. 
 - Firstly, it allows anyone with a good idea, even if it is an idea that others would not immediately recognize as being worthwhile, to have sufficient time to develop a prototype, demo, or presentation to show the value of their idea. 
 - Secondly, it provides management with visibility into activity that might otherwise be hidden. In other companies that don’t have an official policy of allowing 20% time, engineers sometimes work on “skunkwork” projects without informing management. It’s much better if engineers can be open about such projects, describing their work on such projects in their regular status updates, even in cases where their management may not agree on the value of the project. Having a company-wide official policy and a culture that supports it makes this possible. 
 - Thirdly, by allowing engineers to spend a small portion of their time working on more fun stuff, it keeps engineers motivated and excited by what they do, and stops them getting burnt out, which can easily happen if they feel compelled to spend 100% of their time working on more tedious tasks. The difference in productivity between engaged, motivated engineers and burnt out engineers is a lot more than 20%. 
 - Fourthly, it encourages a culture of innovation. Seeing other engineers working on fun experimental 20% projects encourages everyone to do the same.

## 3.2. Objectives and Key Results (OKRs)

Individuals and teams at Google are required to explicitly document their goals and to assess their progress towards these goals. Teams set quarterly and annual objectives, with measurable key results that show progress towards these objectives. This is done at every level of the company, going all the way up to defining goals for the whole company. Goals for individuals and small teams should align with the higher-level goals for the broader teams that they are part of and with the overall company goals. At the end of each quarter, progress towards the measurable key results is recorded and each objective is given a score from 0.0 (no progress) to 1.0 (100% completion). OKRs and OKR scores are normally made visible across Google (with occasional exceptions for especially sensitive information such as highly confidential projects), but they not used directly as input to an individual’s performance appraisal.

OKRs should be set high: the desired target overall average score is 65%, meaning that a team is encouraged to set as goals about 50% more tasks than they are likely to actually accomplish. If a team scores significantly higher than that, they are encouraged to set more ambitious OKRs for the following quarter (and conversely if they score significantly lower than that, they are encouraged to set their OKRs more conservatively the next quarter).

OKRs provide a key mechanism for communicating what each part of the company is working on, and for encouraging good performance from employees via social incentives... engineers know that their team will have a meeting where the OKRs will be scored, and have a natural drive to try to score well, even though OKRs have no direct impact on performance appraisals orcompensation. 

Defining key results that are objective and measurable helps ensure that this human drive to perform well is channelled to doing things that have real concrete measurable impact on progress towards shared objectives.

## 3.3 Project approval

Although there is a well-defined process for launch approvals, Google does not have a well-defined process for project approval or cancellation. Despite having been at Google for nearly 10 years, and now having become a manager myself, I still don’t fully understand how such decisions are made. In part this is because the approach to this is not uniform across the company. Managers at every level are responsible and accountable for what projects their teams work on, and exercise their discretion as they see fit. In some cases, this means that such decisions are made in a quite bottom-up fashion, with engineers being given freedom to choose which projects to work on, within their team’s scope. In other cases, such decisions are made in a much more top-down fashion, with executives or managers making decisions about which projects will go ahead, which will get additional resources, and which will get cancelled.

## 3.4 Corporate reorganizations

Occasionally an executive decision is made to cancel a large project, and then the many engineers who had been working on that project may have to find new projects on new teams.

Similarly there have been occasional “defragmentation” efforts, where projects that are split across multiple geographic locations are consolidated into a smaller number of locations, with engineers in some locations being required to change team and/or project in order to achieve this. In such cases, engineers are generally given freedom to choose their new team and role from within the positions available in their geographic location, or in the case of defragmentation, they may also be given the option of staying on the same team and project by moving to a different location.

In addition, other kinds of corporate reorganizations, such as merging or splitting teams and changes in reporting chains, seem to be fairly frequent occurrences, although I don’t know how Google compares with other large companies on that. In a large, technology-driven organization, somewhat frequent reorganization may be necessary to avoid organizational inefficiencies as the technology and requirements change.