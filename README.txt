----------
How to run
----------

Use ls and cd to get to this folder then run
    python3 -m http.server -b 0.0.0.0 8000

Eg:

    ~ $ ls
    Documents  Templates   Downloads  Music       Public
    daryosh    Desktop     Pictures   Videos

    ~ $ cd daryosh/

    ~/daryosh $ ls
    D  daryoshgl  karyme

    ~/daryosh $ cd karyme/

    ~/daryosh/karyme $ ls
    fonts  images  index.html  js  obj  shaders  style.css

    ~/daryosh/karyme $ python3 -m http.server -b 0.0.0.0 8000
    Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...


If you get an error saying don't have python3, try this instead:

    ~/daryosh/karyme $ python3 -m http.server -b 0.0.0.0 8000
    bash: python3: command not found
    ~/daryosh/karyme $ python -m SimpleHTTPServer
    Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...


------------
Run on phone
------------

Make sure your phone is on the same wifi as your computer

Find your IP address by running:
    ifconfig

It'll be something like 192.168.1.20

Then on your phone in safari, go to
    http://[IP address]:8000


--------------
Move key light
--------------

Open js/main.js, line 31, and change the X, Y and Z (left-right, down-up, in-out) of the shadow_lights[0]:
    shadow_lights[0].position = new Float32Array([-0.0, 10.0, 3.0])


-------------------
Change light colors
-------------------

Open shaders/basic.frag, 10 lines from the bottom, change key_color, fill_color, and back_color.
  vec3 key_color  = 1.00 * vec3(1.0,0.49,0.7);
  vec3 fill_color = 0.20 * vec3(1.0,1.00,1.0);
  vec3 back_color = 1.00 * vec3(1.0,0.84,0.0);

Format is strength * vec3(red, green, blue)
