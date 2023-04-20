# Turtlebot-Psiturk

This research study uses psiTurk, Heroku, Ttsx3, and ROS2 in order to gauge how language barriers, differing cultures, and other factors may influnce one's opinion on the use of robots in the workforce. 

## Packages

### psiTurk

psiTurk has many issues with package dependencies. Despite the most recent update (3.3.1) promising to relieve package dependencies with pyOpenSsl, psiTurk will install but not be able to run until you set Python's cryptography pacakge to use version 38.0.2. You can do this by adding  ```cryptography==38.0.4``` to requirements.txt.  

Then install the package with  
```pip install -r requirements.txt```  

You will also need to run **Python 3.8.16** on your local machine.

### Heroku

As mentioned above, you must set the cryptography package by writing ```cyrptography==38.0.2``` in the requirements.txt file in the root of the experiment.  

**Note** that although you must run Python 3.8.16 locally, you may use any version up to 3.11.3 (latest release as of the development of this study) on Heroku. This experiment uses the most up-to-date version of Python3 (v3.11.3). Python 3.8.16, 3.9.16, 3.10.16, and 3.11.3 all yeild the same results.

You can specify which version of Python you wish to use on Heroku in the runtime.txt file in the root directory of your study. In this case, Python 3.11.3 is set with the line ```python-[version_number]```.

### ROS2, ROS2_Voice_Control, PocketSphinx, and Ttsx3

The content of this study was made using [ROS2 Voice Control](https://github.com/zjhillman/ros2_voice_control), a ROS2 package which uses CMU PocketShinx and Ttsx3 to give basic voice commands and spoken responses to a turtlebot operating on ROS2. This pacakage was made as other voice command packages were written for ROS1 which is no longer supported on Ubuntu 22.0.4 (Jammy Jellyfish) and above.

ROS2 Voice Control uses two nodes to process data, one which processes voice input into commands and one which processes the commands into actions. These actions may be interpretted as movement for the turtlebot or to give verbal responses to the user, often asking for clarification if the given command was unclear.

The first node must incorporate PocketSphinx and pyAudio. pyAudio must be able to regularly update the buffer with input data from the microphone. Any actions that block or interupt the code will cause inconsistancies in the input data and will cause PocketSphinx to not be able to detect commands. At regular intervals, PocketSphinx will decode the buffer by using the given keywordlist and send the decoded data to the sister node.

The other node will receive the decoded data, process Twist commands, and relay them to the turtlebot. This node essentially acts as the brain of the turtlebot. This ndoe will also incorpate Ttysx3 to give the turtlebot a voice to respond with. This package is import as you can easily update the engine to alter the speed at which the turtlebot communicates as well as change the voice. This is extremely helpful for the study becasue we can judge if people react differently when the voice has a masceline or feminine vocal range.
