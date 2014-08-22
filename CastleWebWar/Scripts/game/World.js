$(function () {
    
    Physics(function (world) {
        window.world = world;

        var gameArea = $("#game");
        var gameInfoArea = $("#game-info");

        var offsetTop = gameInfoArea.offset().top + gameInfoArea.height();
        var offsetLeft = gameArea.offset().left;

        var viewWidth = gameArea.width()
        , viewHeight = gameArea.height() - gameInfoArea.height()
        // bounds of the window
        , viewportBounds = Physics.aabb(offsetLeft, offsetTop, viewWidth + offsetLeft, viewHeight + offsetTop)
        //, edgeBounce
        //, renderer
        ;


        var renderer = Physics.renderer('canvas', {
            el: 'viewport',
            width: window.innerWidth,// viewWidth + gameArea.offset().left,
            height: window.innerHeight,// viewHeight + offsetTop,
            meta: false, // don't display meta data
            styles: {
                // set colors for the circle bodies
                'circle': {
                    strokeStyle: '#351024',
                    lineWidth: 1,
                    fillStyle: '#d33682',
                    angleIndicator: '#351024'
                },
                'rectangle': {
                    fillStyle: '#ff0000'
                }
            }
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
        });            
        
        var edgeCollisionDetectionBehaviour = Physics.behavior('edge-collision-detection', { aabb: viewportBounds } );
        world.add(edgeCollisionDetectionBehaviour);

        var bodyCollisionDetectionBehaviour = Physics.behavior('body-collision-detection');
        world.add(bodyCollisionDetectionBehaviour);      
        world.add(Physics.behavior('sweep-prune'));      

        var brick = Physics.body('rectangle', {
            x: offsetLeft + 100,
            y: 500,
            width: 20,
            height: 20,
            label: 'brick',
        });



        world.addBody(brick);

        // add some gravity
       // world.add(Physics.behavior('constant-acceleration'));

        world.gravity = Physics.behavior('constant-acceleration');
        world.gravity.connect(world);

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function (time, dt) {            
            world.step(time);                              
        });

        // start the ticker
        Physics.util.ticker.start();
                
        world.on('collisions:detected', function (data) {
            var c;
            var triggerEvent = false;
            for (var i = 0, l = data.collisions.length; i < l; i++) {
                c = data.collisions[i];
                bullet = null;
                if (c.bodyA.label == 'bullet' || c.bodyA.label == 'brick') {
                    world.removeBody(c.bodyA);
                    triggerEvent = true;
                }
                if (c.bodyB.label == 'bullet' || c.bodyB.label == 'brick') {
                    world.removeBody(c.bodyB);
                    triggerEvent = true;
                }
            }
            if (triggerEvent) {
                $(window).trigger("colission");
            }
        });
    });


});
