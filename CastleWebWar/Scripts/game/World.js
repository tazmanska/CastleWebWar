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
                    angleIndicator: '#d33682'
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

        for (var i = 0, x, y = 440; i < 42; i++) {
            x = 735 + offsetLeft + ((i % 3) * 60);
            if (i % 3 == 0) {
                y += 22;
            }
            world.addBody(Physics.body('rectangle', {
                x: x,
                y: y,
                width: 40,
                height: 15,
                label: 'wall',
                styles: {
                    fillStyle: '#0000ff',
                    lineWidth: 2
                }
            }));
        }

        for (var i = 0, y; i < 10; i++) {
            world.addBody(Physics.body('rectangle', {
                x: offsetLeft + 50,
                y: 600 + (i * 20),
                width: 20,
                height: 15,
                label: 'brick',
                player: isPlayerLeft
            }));
        }

        for (var i = 0, y; i < 10; i++) {
            world.addBody(Physics.body('rectangle', {
                x: offsetLeft + 1550,
                y: 600 + (i * 20),
                width: 20,
                height: 15,
                label: 'brick',
                player: !isPlayerLeft
            }));
        }

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
            var triggerEvent2 = false;
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

                if (c.bodyA.label == 'wall') {
                    world.removeBody(c.bodyA);
                }
                if (c.bodyB.label == 'wall') {
                    world.removeBody(c.bodyB);
                }
            }
            if (triggerEvent) {
                $(window).trigger("colission");
            }
        });
    });


});
