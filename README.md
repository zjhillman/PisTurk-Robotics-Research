# Turtlebot-Psiturk

This research study uses psiTurk, Heroku, Ttsx3, and ROS2 in order to gauge how language barriers, differing cultures, and other factors may influnce one's opinion on the use of robots in the workforce. 

## Packages

### psiTurk

psiTurk has no active maintainer and therefore has issues with package dependencies. Despite the most recent update (3.3.1) promising to relieve package dependencies with pyOpenSsl, psiTurk will install but not be able to run until you set Python's cryptography pacakge to use version 38.0.2. You can do this by writing ```pip install cryptography==38.0.4``` so that your local machine will able to run psiTurk. You will need to alter this for Heroku, explained in the Heroku section.

The only alternative to downgrading the cryptagraphy package is to manually patch the files but doing this will not allow the program to run on Heroku.

### Heroku

As mentioned above, you must set the cryptography package by writing ```cyrptography==38.0.2``` in the requirements.txt file in the root of the experiment. Note that while the issue may appear to be a problem with an incompatibility between python and psiTurk, this is not the case. This experiment uses the most up-to-date version of Python3 (v3.11.3)

### ROS2, PocketSphinx, & Ttys3

This experiment uses a voice control pacakge to give voice commands to a turtlebot and have it respond in short phrases using CMU PocketSphinx and Ttsx3. To get this packages running correctly, you will need two nodes to process and direct voice commands.  

One node must incorporate PocketSphinx and pyAudio. pyAudio must be able to regularly update the buffer with input data from the microphone. Any actions that block or interupt the code will cause inconsistancies in the input data and will cause PocketSphinx to not be able to detect commands. At regular intervals, PocketSphinx will decode the buffer by using the given keywordlist and send the decoded data to the sister node.

The other node will receive the decoded data, process Twist commands, and relay them to the turtlebot. This node essentially acts as the brain of the turtlebot. This ndoe will also incorpate Ttysx3 to give the turtlebot a voice to respond with. This package is import as you can easily update the engine to alter the speed at which the turtlebot communicates as well as change the voice. This is extremely helpful for the study becasue we can judge if people react differently when the voice has a masceline or feminine vocal range.