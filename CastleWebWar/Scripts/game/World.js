$(function () {
    
    Physics(function (world) {
        window.world = world;

        var viewWidth = window.innerWidth
        , viewHeight = window.innerHeight
        // bounds of the window
        , viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
        //, edgeBounce
        //, renderer
        ;


        var renderer = Physics.renderer('canvas', {
            el: 'viewport',
            width: viewWidth,
            height: viewHeight,
            meta: false, // don't display meta data
            styles: {
                // set colors for the circle bodies
                'circle': {
                    strokeStyle: '#351024',
                    lineWidth: 1,
                    fillStyle: '#d33682',
                    angleIndicator: '#351024'
                }
            }
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
        });

        // add a circle
        //world.add(
        //    Physics.body('circle', {
        //        x: 300, // x-coordinate
        //        y: 630, // y-coordinate
        //        vx: 0.8, // velocity in x-direction
        //        vy: -0.3, // velocity in y-direction
        //        radius: 20
        //    })
        //);

        // ensure objects bounce when edge collision is detected
        //world.add(Physics.behavior('body-impulse-response'));

        // add some gravity
        world.add(Physics.behavior('constant-acceleration'));

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function (time, dt) {

            world.step(time);
        });

        // start the ticker
        Physics.util.ticker.start();

    });


});
