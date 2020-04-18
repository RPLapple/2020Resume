let Vector = function (x,y){
    this.x = x || 0
    this.y = y || 0
  }
  // if there's no x or y, it will be 0

  // for actions+-*/
  Vector.prototype.add=function(v){
    return new Vector(this.x+v.x,this.y+v.y)
  }
  Vector.prototype.length=function(){
    return Math.sqrt(this.x*this.x+this.y*this.y)
  }
  Vector.prototype.set=function(v){
    this.x=v.x
    this.y=v.y
  }
  // reset x & y  

  Vector.prototype.equal=function(v){
    return (this.x==v.x && this.y==v.y)
  }

  //clone, so we don't accidently change original vector
  Vector.prototype.clone=function(){
    return new Vector(this.x,this.y)
  }

  // multiple
  Vector.prototype.mul=function(s){
    return new Vector(this.x*s,this.y*s)
  }
  
  // Defult for snake
  // [] to record each x,y of body
  // .speed=>to the right+1
  let Snake = function(){
    this.body = []
    this.maxLength = 5
    this.head = new Vector(0,0)
    this.speed = new Vector(1,0)
    this.direction="Right"
    this.setDirection(this.direction)
  }

  // Snake moving
  // Head+speed-extraTail, old head join body
  Snake.prototype.update = function(){
    let newHead = this.head.add(this.speed)
    this.body.push( this.head) 
    this.head = newHead
    while(this.body.length>this.maxLength){
      this.body.shift()
    }
  }

  Snake.prototype.setDirection = function(dir){
    let target
    if (dir==="Up"){
      target = new Vector(0,-1)
    }
    if (dir==="Down"){
      target = new Vector(0,1)
    }
    if (dir==="Left"){
      target = new Vector(-1,0)
    }
    if (dir==="Right"){
      target = new Vector(1,0)
    }
    // if the sanke is moving totally opposite, do not execute
    if (target.equal(this.speed)==false && target.equal(this.speed.mul(-1))==false){
      this.speed=target
    }
  }
  // set the border for snake
  Snake.prototype.checkBoundary = function(gameWidth){
    let xInRange= 0<=this.head.x && this.head.x < gameWidth
    let yInRange= 0<=this.head.y && this.head.y < gameWidth
    return xInRange && yInRange
  }
  
  let Game = function(){
    this.bw=12
    this.bs=2
    this.gameWidth=40
    this.speed = 30
    this.snake = new Snake()
    this.foods = []
    this.generateFood()
    this.init()
    this.start = false
  }
    
  Game.prototype.init = function(){
    this.canvas = document.getElementById("mycanvas")
    //set the size, boxSize*Qty+space*(Num-1)
    this.canvas.width=this.bw*this.gameWidth + this.bs * (this.gameWidth-1)
    this.canvas.height=this.canvas.width
    this.ctx = this.canvas.getContext("2d")
    // .render to see result
    this.render()
    setTimeout(()=>{this.update()},1000/this.speed)
  }
  Game.prototype.startGame = function(){
    this.start=true
    $(".panel").hide()
    // restart after dead, or it will continue with old one
    this.snake = new Snake()
    this.playSound("C#5",-20)
    this.playSound("E5",-20,200)
  }
  Game.prototype.endGame = function(){
    this.start=false
    $("h2").text("Score: "+ (this.snake.body.length-5)*10)
    // hide the original interface before start
    $(".panel").show()
    this.playSound("A3")
    this.playSound("E2",-10,200)
    this.playSound("A2",-10,400)
  }
  // calculate the distance of the box* +, then get the real 
  Game.prototype.getPositon=function(x,y){
    return new Vector(
      x*this.bw+(x-1)*this.bs,
      y*this.bw+(y-1)*this.bs
    )
  }
  // .fillRect(startX, startY, width, height)
  Game.prototype.drawBlock=function(v,color,offset){
    this.ctx.fillStyle=color
    let pos = this.getPositon(v.x,v.y)
    this.ctx.fillRect(pos.x,pos.y,this.bw,this.bw)  
  }
  //effect: for the food circle
  //set up if r<100, will recall itself.
  //100-r/100 => transparent
  Game.prototype.drawEffect = function(x,y){
    let r = 2
    let pos = this.getPositon(x,y)
    let _this = this
    let effect = ()=>{
      r++
      _this.ctx.strokeStyle = "rgba(255,0,0,"+(100-r)/100+")"
      _this.ctx.beginPath()
      _this.ctx.arc(pos.x+_this.bw/2,pos.y+_this.bw/2, 20*Math.log(r/2),0,Math.PI*2)
      _this.ctx.stroke()
      //call inside and outsdie, so it can renew
      if (r<100){
        requestAnimationFrame(effect)
      }
    }
    requestAnimationFrame(effect)
  }
  // to update 
  // render:draw the back ground, all the boxes
  //.fillrect, background(0,0,width, height)
  //for, each time draw a x line, y will be add on too. 
  Game.prototype.render=function(){
    this.ctx.fillStyle = "rgba(0,0,0,0.3)"
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
    for(let x=0;x<this.gameWidth;x++){
      for(let y=0;y<this.gameWidth;y++){
         this.drawBlock(new Vector(x,y),"rgba(255,255,255,0.03)")
      }
    }
    //(snakeposition, which one)
    this.snake.body.forEach((sp,i)=>{
       this.drawBlock(sp,"white")
    })
    //(foodPosition) draw out
    this.foods.forEach(sp=>{
       this.drawBlock(sp,"red")
    })
    //re-execute this render
    requestAnimationFrame(()=>{this.render()})
  }

  //when sankeHead v = food v =>snakeL+1, food-1
  //playsound=>create food but with sound, 200=>delay
  //-20 decibel
  Game.prototype.generateFood = function(){
    let x = Math.floor(Math.random()*this.gameWidth)
    let y = Math.floor(Math.random()*this.gameWidth)
    this.foods.push(new Vector(x,y))
    this.drawEffect(x,y)
    this.playSound("E5",-20)
    this.playSound("A5",-20,200)
  }
  //.start => only update if the game start
  //.splice => delete the food, or it will be there forever
  Game.prototype.update = function(){
    if (this.start){
      this.playSound("A2",-20)
      this.snake.update() 
      this.foods.forEach((food,i)=>{
        if (this.snake.head.equal(food)){
          this.snake.maxLength++
          this.foods.splice(i,1)
          this.generateFood()
        }
      })
      // check if the snake bomped to itself, or inside of bundary
      this.snake.body.forEach(sp=>{
        if (sp.equal(this.snake.head)){
          console.log("collide body")
          this.endGame()
        }   
      })
      if (this.snake.checkBoundary(this.gameWidth)==false){
        this.endGame()
      }
    }
    this.speed = Math.sqrt(this.snake.body.length)+5
    setTimeout(()=>{this.update()},parseInt(1000/this.speed))
  }

  //.Synth=>have sound, .toMaster()=>Connect to stereo 
  //volume => 0 ~ -xxx decibel
  //when || 0 => if didn't set a specific time, just execute. 
  Game.prototype.playSound = function(note,volume,when){
    setTimeout(function(){
      var synth = new Tone.Synth().toMaster();     
      synth.volume.value= volume || -12;
      synth.triggerAttackRelease(note, "8n");
    },when || 0)
  }

  // to control snake direction with keyboard
  // when press the button, arrow change to ""
  let game = new Game()
  $(window).keydown(function(evt){
    console.log(evt.key)
    game.snake.setDirection(evt.key.replace("Arrow",""))
  })