This is the UI component of my robot FREN-4D.

The robot has two eyes made from 8x8 LED matrixes, which display an animation. 
The LED matrixes work by sending 8 values from 0 to 255, and uses the binary representation of that value to determine which LEDs are lit on a row (e.g. 255 = 11111111, which lights up every LED on a row).

This UI will be used to easily create and modify these animations. 
A full animation will contain of any number of frames and a value to determine if it is an animation for the left, right, or both eyes.
At some point, they will also contain some tags to describe the "mood" of the animation, so that an "angry eyes" animation can be tagged with "angry" and used accordingly.
Every frame consists of a frame data array of 8 integers between 0 and 255 (i.e. the actual graphics) and a frame time (how long the frame should be displayed in ms).

The animations/frame data will be stored in JSON files, which in turn will be read by the robot and sent to the matrixes. 

The robot itself runs on Python on a Raspberry Pi 2 B. Probably I'll upload that code too once it's finished, as well as a build log of FREN-4D!

So far this UI doesn't do much though, but it's getting there!