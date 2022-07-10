	    "use strict";
        let canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let ctx = canvas.getContext("2d");      
        let blocks = [];
        let colors = [];
        let rows = 10;
        let column = 10;
        let mouseX = 0;
        let mouseY = 0;
        let scale = 50;
        let clicks = 0;
        let points = 0;
        let touchingArray = [];
        let selectedBlock = 0;
        let selectedBlockX = 0;
        let selectedBlockY = 0;
        let selectedBlockOutOfBounds = false;
        let moves = 0;
        let blockSize = 60;

        // difficulty 3 - 8
        let urlParams = new URLSearchParams(window.location.search);
        let difficulty_Param = urlParams.get('difficulty');
        let difficulty = difficulty_Param;
        if (difficulty == undefined) {
            difficulty = 5;
        }
        document.getElementById("difficulty" + difficulty).classList.add("disabled")

        let imgdefault_1 = new Image(); imgdefault_1.src = 'default_1.png';
        let imgdefault_2 = new Image(); imgdefault_2.src = 'default_2.png';
        let imgdefault_3 = new Image(); imgdefault_3.src = 'default_3.png';
        let imgdefault_4 = new Image(); imgdefault_4.src = 'default_4.png';
        let imgdefault_5 = new Image(); imgdefault_5.src = 'default_5.png';
        let imgdefault_6 = new Image(); imgdefault_6.src = 'default_6.png';
        let imgdefault_7 = new Image(); imgdefault_7.src = 'default_7.png';



        function create_block(row, column, type) {
            this.row = row;
            this.column = column;
            this.x = row * blockSize;
            this.y = column * blockSize;
            this.type = type;
            this.active = true;
            this.isMoving = false;
            this.framesToRespawn = 0;
        }

        for (let i = 0; i < 6; i++) {
            for (let i2 = 0; i2 < 8; i2++) {
                let randomType = getRndInteger(1, difficulty);
                blocks.push(new create_block(i, i2, randomType));
            }
        }

        let isMovingGlobal = false;

        function draw() {

            canvas.width = 360;
            canvas.height = 540;

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);


            isMovingGlobal = false;
            for (let i = 0; i < blocks.length; i++) {
                ctx.fillStyle = blocks[i].type;
                blocks[i].isMoving = false


                // Animating the blocks moving on the grid
                if (blocks[i].row * blockSize > blocks[i].x) {
                    blocks[i].x += 2;
                    blocks[i].isMoving = true;
                    isMovingGlobal = true;
                }
                if (blocks[i].column * blockSize > blocks[i].y) {
                    blocks[i].y += 2;
                    blocks[i].isMoving = true;
                    isMovingGlobal = true;
                }
                if (blocks[i].row * blockSize < blocks[i].x) {
                    blocks[i].x -= 2;
                    blocks[i].isMoving = true;
                    isMovingGlobal = true;
                }
                if (blocks[i].column * blockSize < blocks[i].y) {
                    blocks[i].y -= 2;
                    blocks[i].isMoving = true;
                    isMovingGlobal = true;
                }

                // Animation before removing block
                if (blocks[i].active == false) {
                    ctx.globalAlpha = 1.0;
                    blocks[i].framesToRespawn += 1;

                    if (blocks[i].framesToRespawn > 100) {
                        blocks[i].column = -5;
                        blocks[i].y = -300;
                        blocks[i].type = getRndInteger(1, difficulty);
                        blocks[i].active = true;
                    }

                } else {
                    ctx.globalAlpha = 0.6;
                    blocks[i].framesToRespawn = 0;
                }

                ctx.drawImage(getBlockImage(blocks[i].type), blocks[i].x, blocks[i].y);

                // User released the block they where holding
                if (mouseUp == true && MouseIntersect(blocks[i].x, blocks[i].y, blockSize, blockSize, mouseX, mouseY, 10, 10)) {
                    if (selectedBlock != blocks[i].type && selectedBlock != 0 && selectedBlockOutOfBounds == false) {
                        blocks[i].type = selectedBlock;
                        moves += 1;
                        document.getElementById("moves").innerHTML = moves;
                    }
                    mouseUp = false;
                }

                // User is selecting a block
                if (MouseIntersect(blocks[i].x, blocks[i].y, blockSize, blockSize, mouseX, mouseY, 10, 10) && mouseDown == false) {
                    selectedBlock = blocks[i].type;
                    selectedBlockX = blocks[i].x;
                    selectedBlockY = blocks[i].y;
                }

                // User is holding a block
                if (mouseDown == true) {
                    ctx.globalAlpha = 1;

                    // Release block if it goes out of bounds (the user can not move the blocks 2 steps)
                    if (!MouseIntersect(mouseX - 30, mouseY - 30, blockSize + (blockSize / 2), blockSize + (blockSize / 2), selectedBlockX, selectedBlockY, blockSize + (blockSize / 2), blockSize + (blockSize / 2))) {
                        ctx.globalAlpha = 0;
                        selectedBlockOutOfBounds = true;
                    } else {
                        selectedBlockOutOfBounds = false;
                    }
                    ctx.drawImage(getBlockImage(selectedBlock), mouseX - 30, mouseY - 30);
                }

            }

            if (isMovingGlobal == false) {
                fall()
            }

            ctx.fillStyle = "white";
            ctx.font = "30px Arial";
            ctx.fillText(points, 10, 42);



        }

        function getBlockImage(type) {
            let image = imgdefault_1;
            switch (type) {
                case 0:
                    image = imgdefault_1;
                    break;
                case 1:
                    image = imgdefault_1;
                    break;
                case 2:
                    image = imgdefault_2;
                    break;
                case 3:
                    image = imgdefault_3;
                    break;
                case 4:
                    image = imgdefault_4;
                    break;
                case 5:
                    image = imgdefault_5;
                    break;
                case 6:
                    image = imgdefault_6;
                    break
                case 7:
                    image = imgdefault_7;

            }
            return image;
        }


        function checkAllTouching() {
            for (let i = 0; i < blocks.length; i++) {
                touchingArray = []
                touching(blocks[i], "");

                RemoveTouching()


                touchingArray = []
            }
        }


        function touching(selectedBlock, discoveredAt) {

            // we have already checked this block
            if (touchingArray.includes(selectedBlock)) {
                return;
            }

            // Make sure everything is added, not just connecting blocks
            if (discoveredAt != "") {
                if (!touchingArray.includes(selectedBlock)) {
                    touchingArray.push(selectedBlock);
                }
            }

            // Right
            if (discoveredAt != "Left") {
                let block1 = blocks.find(o => o.row === selectedBlock.row + 1 && o.column === selectedBlock.column);
                if (block1) {
                    if (selectedBlock.type == block1.type) {
                        if (!touchingArray.includes(selectedBlock)) {
                            touchingArray.push(selectedBlock);
                        }
                        touching(block1, "Right");
                    }
                }
            }

            // Left
            if (discoveredAt != "Right") {
                let block2 = blocks.find(o => o.row === selectedBlock.row - 1 && o.column === selectedBlock.column);
                if (block2) {
                    if (selectedBlock.type == block2.type) {
                        if (!touchingArray.includes(selectedBlock)) {
                            touchingArray.push(selectedBlock);
                        }
                        touching(block2, "Left");
                    }
                }
            }

            // Down
            if (discoveredAt != "Up") {
                let block3 = blocks.find(o => o.row === selectedBlock.row && o.column === selectedBlock.column + 1);
                if (block3) {
                    if (selectedBlock.type == block3.type) {
                        if (!touchingArray.includes(selectedBlock)) {
                            touchingArray.push(selectedBlock);
                        }
                        touching(block3, "Down");
                    }
                }
            }

            // Up
            if (discoveredAt != "Down") {
                let block4 = blocks.find(o => o.row === selectedBlock.row && o.column === selectedBlock.column - 1);
                if (block4) {
                    if (selectedBlock.type == block4.type) {
                        if (!touchingArray.includes(selectedBlock)) {
                            touchingArray.push(selectedBlock);
                        }
                        touching(block4, "Up");
                    }
                }
            }

            return touchingArray

        }


        function RemoveTouching() {
            if (touchingArray.length > 3) {
                for (let i = 0; i < touchingArray.length; i++) {
                    for (let i2 = 0; i2 < blocks.length; i2++) {
                        if (touchingArray[i].row == blocks[i2].row && touchingArray[i].column == blocks[i2].column) {
                            blocks[i2].active = false;
                        }
                    }
                }

                points += 1 * touchingArray.length;
                return true;
            }
            return false;
        }





        function fall() {
            // Down
            let wasmoved = false;
            for (let i = 0; i < blocks.length; i++) {
                if ((blocks[i].column * blockSize) < canvas.height - blockSize) {
                    let spaceOccupied = false;

                    for (let i2 = 0; i2 < blocks.length; i2++) {
                        if ((blocks[i].column + 1) == blocks[i2].column && blocks[i].row == blocks[i2].row) {
                            spaceOccupied = true;
                        }
                    }
                    if (spaceOccupied == false) {
                        blocks[i].column += 1;
                        wasmoved = true
                    }

                }
            }

            // Right
            if (wasmoved == false) {
                for (let i = 0; i < blocks.length; i++) {
                    if ((blocks[i].row * blockSize) < canvas.width - blockSize && (blocks[i].column * blockSize) < canvas.height - blockSize) {
                        let spaceOccupied = false;

                        for (let i2 = 0; i2 < blocks.length; i2++) {
                            if ((blocks[i].column + 1) == blocks[i2].column && (blocks[i].row + 1) == blocks[i2].row) {
                                spaceOccupied = true;
                            }
                        }
                        if (spaceOccupied == false) {
                            blocks[i].column += 1;
                            blocks[i].row += 1;
                            wasmoved = true
                        }

                    }
                }
            }

            // Left
            if (wasmoved == false) {
                for (let i = 0; i < blocks.length; i++) {
                    if ((blocks[i].row * blockSize) < canvas.width - blockSize && (blocks[i].column * blockSize) < canvas.height - blockSize) {
                        let spaceOccupied = false;

                        for (let i2 = 0; i2 < blocks.length; i2++) {
                            if ((blocks[i].column + 1) == blocks[i2].column && (blocks[i].row - 1) == blocks[i2].row) {
                                spaceOccupied = true;
                            }
                        }
                        if (spaceOccupied == false) {
                            if (blocks[i].row > 0) {
                                blocks[i].column += 1;
                                blocks[i].row -= 1;
                                wasmoved = true
                            }
                        }

                    }
                }
            }

            if (wasmoved == false) {
                checkAllTouching();
            }

            return wasmoved;

        }

        let drawInterval = setInterval(draw, 7);
        //let fallInterval = setInterval(fall, 300);
        //let checkInterval = setInterval(checkAllTouching, 2000);


        // Mouse controll
        document.getElementById("canvas").addEventListener("mousemove", function (e) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        });
        let mouseDown = false;
        let mouseUp = false;
        function mouse_down() {
            mouseDown = true;
            mouseUp = false;
        }
        function mouse_up() {
            mouseUp = true;
            mouseDown = false;
        }

        function MouseIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
            // Check x and y for overlap
            if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
                return false;
            }
            return true;
        }



        function getRndInteger(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

