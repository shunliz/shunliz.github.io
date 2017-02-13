﻿---
layout: post
title:  "10年老员工谈Google的软件工程实践（三）"
date:   2017-02-13 16:01:09 -0800
categories: software-engineering
tags: software-engineering
---
 
# 4. People management 

## 4.1. Roles

As we’ll explain in more detail below, Google separates the engineering and management career progression ladders, separates the tech lead role from management, embeds research within engineering, and supports engineers with product managers, project managers, and site reliability engineers (SREs). It seems likely that at least some of these practices are important to sustaining the culture of innovation that has developed at Google.

Google has a small number of different roles within engineering. Within each role, there is a career progression possible, with a sequence of levels, and the possibility of promotion (with associated improvement to compensation, e.g. salary) to recognize performance at the next level.

The main roles are these:

 - Engineering Manager

 This is the only people management role in this list. Individuals in other roles such as Software Engineer may manage people, but Engineering Managers always manage people. Engineering Managers are often former Software Engineers, and invariably have considerable technical expertise, as well as people skills.
 
There is a distinction between technical leadership and people management.
Engineering Managers do not necessarily lead projects; projects are led by a Tech Lead, who can be an Engineering Manager, but who is more often a Software Engineer. A project’s Tech Lead has the final say for technical decisions in that project.

Managers are responsible for selecting Tech Leads, and for the performance of their teams. They perform coaching and assisting with career development, do performance evaluation (using input from peer feedback, see below), and are responsible for some aspects of compensation. They are also responsible for some parts of the hiring process.

Engineering Managers normally directly manage anywhere between 3 and 30 people, although 8 to 12 is most common.

 - Software Engineer (SWE)

 Most people doing software development work have this role. The hiring bar for software engineers at Google is very high; by hiring only exceptionally good software engineers, a lot of the software problems that plague other organizations are avoided or minimized.

Google has separate career progression sequences for engineering and management. Although it is possible for a Software Engineer to manage people, or to transfer to the Engineering Manager role, managing people is not a requirement for promotion, even at the highest levels. At the higher levels, showing leadership is required, but that can come in many forms. For example creating great software that has a huge impact or is used by very many other engineers is sufficient. This is important, because it means that people who have great technical skills but lack the desire or skills to manage people still have a good career progression path that does not require them to take a management track. This avoids the problem that some organizations suffer where people end up in management positions for reasons of career advancement but neglect the people management of the people in their team.

 - Research Scientist
 
The hiring criteria for this role are very strict, and the bar is extremely high, requiring demonstrated exceptional research ability evidenced by a great publication record *and* ability to write code. Many very talented people in academia who would be able to qualify for a Software Engineer role would not qualify for a Research Scientist role at Google; most of the people with PhDs at Google are Software Engineers rather than Research Scientists. Research scientists are evaluated on their research contributions, including their publications, but apart from that and the different title, there is not really that much difference between the Software Engineer and Research Scientist role at Google. Both can do original research and publish papers, both can develop new product ideas and new technologies, and both can and do write code and develop products. Research Scientists at Google usually work alongside Software Engineers, in the same teams and working on the same products or the same research. This practice of embedding research within engineering contributes greatly to the ease with which new research can be incorporated into shipping products.

 - Site Reliability Engineer (SRE)

The maintenance of operational systems is done by software engineering teams, rather than traditional sysadmin types, but the hiring requirements for software engineering skills for the SRE are slightly lower than the requirements for the Software Engineering position. The nature and purpose of the SRE role is explained very well and in detail in the SRE book [7], so we won’t discuss it further here.

 - Product Manager
 
Product Managers are responsible for the management of a product; as advocates for the product users, they coordinate the work of software engineers, evangelizing features of importance to those users, coordinating with other teams, tracking bugs and schedules, and ensuring that everything needed is in place to produce a high quality product. Product Managers usually do NOT write code themselves, but work with software engineers to ensure that the right code gets written.

 - Program Manager / Technical Program Manager
 
Program Managers have a role that is broadly similar to Product Manager, but rather than managing a product, they manage projects, processes, or operations (e.g. data collection). Technical Program Managers are similar, but also require specific technical expertise relating to their work, e.g. linguistics for dealing with speech data.

The ratio of Software Engineers to Product Managers and Program Managers varies across the organization, but is generally high, e.g. in the range 4:1 to 30:1.

## 4.2. Facilities

Google is famous for it’s fun facilities, with features like slides, ball pits, and games rooms.

That helps attract and retain good talent. Google’s excellent cafes, which are free to employees, provide that function too, and also subtly encourage Googlers to stay in the office; hunger is never a reason to leave. The frequent placement of “microkitchens” where employees can grab snacks and drinks serves the same function too, but also acts as an important source of informal idea exchange, as many conversations start up there. Gyms, sports, and on-site massage help keep employees fit, healthy, and happy, which improves productivity and retention.

The seating at Google is open-plan, and often fairly dense. While controversial [20], this encourages communication, sometimes at the expense of individual concentration, and is economical.

Employees are assigned an individual seat, but seats are re-assigned fairly frequently (e.g. every 6-12 months, often as a consequence of the organization expanding), with seating chosen by managers to facilitate and encourage communication, which is always easier between adjacent or nearly adjacent individuals.

Google’s facilities all have meeting rooms fitted with state-of-the-art video conference facilities, where connecting to the other party for a prescheduled calendar invite is just a single tap on the screen.

## 4.3. Training

Google encourages employee education in many ways:
 - New Googlers (“Nooglers”) have a mandatory initial training course.
 - Technical staff (SWEs and research scientists) start by doing “Codelabs”: short online
training courses in individual technologies, with coding exercises.
 - Google offers employees a variety of online and in-person training courses.
 - Google also offers support for studying at external institutions.

In addition, each Noogler is usually appointed an official “Mentor” and a separate “Buddy” to help get them up to speed. Unofficial mentoring also occurs via regular meetings with their manager, team meetings, code reviews, design reviews, and informal processes.

## 4.4 Transfers

Transfers between different parts of the company are encouraged, to help spread knowledge and technology across the organization and improve cross-organization communication. Transfers between projects and/or offices are allowed for employees in good standing after 12 months in a position. Software engineers are also encouraged to do temporary assignments in other parts of the organization, e.g. a six-month “rotation” (temporary assignment) in SRE (Site Reliability Engineering).

## 4.5. Performance appraisal and rewards

Feedback is strongly encouraged at Google. Engineers can give each other explicit positive feedback via “peer bonuses” and “kudos”. Any employee can nominate any other employee for a “peer bonus” -- a cash bonus of $100 -- up to twice per year, for going beyond the normal call of duty, just by filling in a web form to describe the reason. Team-mates are also typically notified when a peer bonus is awarded. Employees can also give “kudos”, formalized statements of praise which provide explicit social recognition for good work, but with no financial reward; for “kudos” there is no requirement that the work be beyond the normal call of duty, and no limit on the number of times that they can be bestowed.

Managers can also award bonuses, including spot bonuses, e.g. for project completion. And as with many companies, Google employees get annual performance bonuses and equity awards based on their performance.

Google has a very careful and detailed promotion process, which involves nomination by self or manager, self-review, peer reviews, manager appraisals; the actual decisions are then made by promotion committees based on that input, and the results can be subject to further review by promotion appeals committees. Ensuring that the right people get promoted is critical to maintaining the right incentives for employees.

Poor performance, on the other hand, is handled with manager feedback, and if necessary with performance improvement plans, which involve setting very explicit concrete performance targets and assessing progress towards those targets. If that fails, termination for poor performance is possible, but in practice this is extremely rare at Google.

Manager performance is assessed with feedback surveys; every employee is asked to fill in an survey about the performance of their manager twice a year, and the results are anonymized and aggregated and then made available to managers. This kind of upward feedback is very important for maintaining and improving the quality of management throughout the organization.

# 5. Conclusions

We have briefly described most of the key software engineering practices used at Google. Of course Google is now a large and diverse organization, and some parts of the organization have different practices. But the practices described here are generally followed by most teams at Google.

With so many different software engineering practices involved, and with so many other reasons for Google’s success that are not related to our software engineering practices, it is extremely difficult to give any quantitative or objective evidence connecting individual practices with improved outcomes. However, these practices are the ones that have stood the test of time at Google, where they have been subject to the collective subjective judgement of many thousands of excellent software engineers.

For those in other organizations who are advocating for the use of a particular practice that happens to be described in this paper, perhaps it will help to say “it’s good enough for Google”.

# Acknowledgements

Special thanks to Alan Donovan for his extremely detailed and constructive feedback, and thanks also to Yaroslav Volovich, Urs Ho?lzle, Brian Strope, Alexander Gutkin, Alex Gruenstein and Hameed Husaini for their very helpful comments on earlier drafts of this paper.

# References

[1] Build in the Cloud: Accessing Source Code, Nathan York, http://google-engtools.blogspot.com/2011/06/build-in-cloud-accessing-source-code.html

[2] Build in the Cloud: How the Build System works, Christian Kemper, http://google-engtools.blogspot.com/2011/08/build-in-cloud-how-build-system-works.htm

[3] Build in the Cloud: Distributing Build Steps, Nathan York http://google-engtools.blogspot.com/2011/09/build-in-cloud-distributing-build-steps.html

[4] Build in the Cloud: Distributing Build Outputs, Milos Besta, Yevgeniy Miretskiy and Jeff Cox http://google-engtools.blogspot.com/2011/10/build-in-cloud-distributing-build.html

[5] Testing at the speed and scale of Google, Pooja Gupta, Mark Ivey, and John Penix, Google engineering tools blog, June 2011.
http://google-engtools.blogspot.com/2011/ 06/testing-at-speed-and-scale-of-google.html

[6] Building Software at Google Scale Tech Talk, Michael Barnathan, Greg Estren, Pepper Lebeck-Jone, Google tech talk, http://www.youtube.com/watch?v=2qv3fcXW1mg

[7] Site Reliability Engineering, Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy, O'Reilly Media, April 2016, ISBN 978-1-4919-2909-4.
https://landing.google.com/sre/book.html

[8] How Google Works, Eric Schmidt, Jonathan Rosenberg. http://www.howgoogleworks.net

[9] What would Google Do?: Reverse-Engineering the Fastest Growing Company in the History of the World, Jeff Jarvis, Harper Business, 2011. https://books.google.co.uk/books/about/What_Would_Google_Do.html?id=GvkEcAAACAAJ&re dir_esc=y

[10] The Search: How Google and Its Rivals Rewrote the Rules of Business and Transformed Our Culture, John Battelle, 8 September 2005. https://books.google.co.uk/books/about/The_Search.html?id=4MY8PgAACAAJ&redir_esc=y 
[11] The Google Story, David A. Vise, Pan Books, 2008. http://www.thegooglestory.com/

[12] Searching for Build Debt: Experiences Managing Technical Debt at Google, J. David Morgenthaler, Misha Gridnev, Raluca Sauciuc, and Sanjay Bhansali. http://static.googleusercontent.com/media/research.google.com/en//pubs/archive/37755.pdf 

[13] Development at the speed and scale of Google, A. Kumar, December 2010, presentation, QCon. http: //www.infoq.com/presentations/Development-at-Google

[14] How Google Tests Software, J. A. Whittaker, J. Arbon, and J. Carollo, Addison-Wesley, 2012.

[15] Release Engineering Practices and Pitfalls, H. K. Wright and D. E. Perry, in Proceedings of the 34th International Conference on Software Engineering (ICSE ’12), IEEE, 2012, pp. 1281–1284. http://www.hyrumwright.org/papers/icse2012.pdf

[16] Large-Scale Automated Refactoring Using ClangMR, H. K. Wright, D. Jasper, M. Klimek, C. Carruth, Z. Wan, in Proceedings of the 29th International Conference on Software Maintenance (ICSM ’13), IEEE, 2013, pp. 548–551.

[17] Why Google Stores Billions of Lines of Code in a Single Repository, Rachel Potvin, presentation. https://www.youtube.com/watch?v=W71BTkUbdqE

[18] The Motivation for a Monolithic Codebase, Rachel Potvin, Josh Levenberg, to be published in Communications of the ACM, July 2016.

[19] Scaling Mercurial at Facebook, Durham Goode, Siddharth P. Agarwa, Facebook blog post, January 7th, 2014. https://code.facebook.com/posts/218678814984400/scaling-mercurial-at-facebook/

[20] Why We (Still) Believe In Private Offices, David Fullerton, Stack Overflow blog post, January 16th, 2015. https://blog.stackoverflow.com/2015/01/why-we-still-believe-in-private-offices/

[21] Continuous Integration at Google Scale, John Micco, presentation, EclipseCon, 2013. http://eclipsecon.org/2013/sites/eclipsecon.org.2013/files/2013-03-24%20Continuous%20Integr ation%20at%20Google%20Scale.pdf