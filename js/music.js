//--------------------------------
//          Square items
//--------------------------------
// Square info, sound(success, fail), special effect 
let Blocks = function(blockAssign,setAssign){ 
    this.allOn=false 
      //is it light or not?
      //()=>value, {}=>object, d=>data, i=>index, el=>element
      //array.map(function(currentValue, index, arr), thisValue)
      //to catch block become another obj, then the action after lighten 
    this.blocks=blockAssign.map((d,i)=>
      ({
        name: d.name,
        el: $(d.selector),
        audio: this.getAudioObject(d.pitch) 
      })
      //linked to sound url
      //add the sound
    )
    //+an object = impoort data 
    this.soundSets = setAssign.map((d,i)=>
      ({
        name: d.name,
        sets: d.sets.map((pitch)=>this.getAudioObject(pitch))
      })
    )
  }
  //shinning on specific square and play specific sound
  // .find => to find the 1st obj has this specific square&name
  //if this block is exsist, it will shine
  Blocks.prototype.flash=function(note){
    let block = this.blocks.find(d=>d.name===note)
    if (block){
      block.audio.currentTime=0
      block.audio.play()
      block.el.addClass("active") 
      //use js+active=>turn on->turn off 
      //better remove inside of JS, so can prevent function conflict
      setTimeout(()=>{
        if (this.allOn==false){
          block.el.removeClass("active")
        }
      },100)
      //remove active class=>when it's not allOn
      //remove after 0.1 sec 
    }
  }
  //Light up all the blocks (all blocks can allOn and allOff)
  //need a variable to record status
  //want allOn can ba earlier than click
  //.forEach=>to get every single one, {}=>execute
  //console=> blocks.turnAllOn() will light up
  Blocks.prototype.turnOnAll=function(note){
    this.allOn=true
    this.blocks.forEach(d=>{
      d.el.addClass("active")
    })
  }
  //turnOffAll
  Blocks.prototype.turnOffAll=function(note){
    this.allOn=false
    this.blocks.forEach(d=>{
      d.el.removeClass("active")
    })
  }
  //Get sounds obj
  Blocks.prototype.getAudioObject=function(pitch){
    return new Audio("https://awiclass.monoame.com/pianosound/set/"+ pitch+".wav")
  }
  //play the sound list (success/fail...)
  Blocks.prototype.playSet = function(type){
    this.soundSets
      .find(set => set.name==type).sets
      .forEach(o=>{
        o.currentTime=0
        o.play()
      })
  }
  
  //--------------------------------
  //          Game Obj
  //--------------------------------
  // define levels
  // block attritubes: element, name, pitch
  let Game = function (){
    this.blocks = new Blocks(
      [
        {selector: ".block1", name: "1", pitch: "1"},
        {selector: ".block2", name: "2", pitch: "2"},
        {selector: ".block3", name: "3", pitch: "3"},
        {selector: ".block4", name: "4", pitch: "4"},
        {selector: ".block5", name: "5", pitch: "5"},
        {selector: ".block6", name: "6", pitch: "6"},
        {selector: ".block7", name: "7", pitch: "7"},
        {selector: ".block8", name: "8", pitch: "8"},
        {selector: ".block9", name: "9", pitch: "9"}
      ],
      [
        {name: "correct", sets: [1,3,5,8] },
        {name: "wrong", sets: [2,4,5.5,7] }
      ]
    )
    //how many levels
    this.levels = [
      "123459876",
      "6759481",
      "11556654433921",
      "334554321123322",
      "321321323136577",
      "66663355553211"
    ]
    let _this = this
    this.currentLevel = 0
    this.playInterval = 400
    this.mode="waiting" 
  }
  
  // console.log("start Level "+ this.currentLevel)
  // get this level data but also provide CL data
  Game.prototype.startLevel = function(){
    this.showMessage("Level "+ this.currentLevel)
    this.startGame(this.levels[this.currentLevel])
  }
  
  Game.prototype.showMessage = function(message){
    console.log(message)
    $(".status").text(message)
  }

  // game will start it once, then it's user's term
  //console=> "1234".split("") =>["1","2","3","4"]
  //until [] is empaty
  Game.prototype.startGame = function(answer){
    this.mode="gamePlay"
    this.answer = answer
    let notes = this.answer.split("")
    let _this = this
    //.showStatus("") level circle shows from beginning but will be hollow
    //this.timer = send back change
    //char：the numbers we took out
      //.shift=>get from beginning and play, then check if it's donw
      //if(the note all gone)
      //if correct, will show text
      // 400 millisec
    this.showStatus("")
    this.timer = setInterval(function(){
      let char = notes.shift()
      if (!notes.length){
        clearInterval(_this.timer)
        _this.startUserInput()
      }
      _this.playNote(char)
    },this.playInterval)
  }
  //play pitch and shine 
  Game.prototype.playNote = function(note){
    console.log(note)
    this.blocks.flash(note)  
  }
  // for user to store input ordern
  // change mode to make user knows it's their turn
  Game.prototype.startUserInput = function(){
    this.userInput = ""
    this.mode="userInput"
  }

  //When user sendinput, need to add the one before to check if it's correct
  // check if it's userInput mode
  //to call and update=>show below full circle
  //if all correct, fo to next Lv
  //when LV+1, change the mode to stop accept UserInput
  // delay 1sec to start another LV
  // console.log("correct")
  Game.prototype.userSendInput = function(inputChar){
    if (this.mode=="userInput"){
      let tempString = this.userInput + inputChar
      this.playNote(inputChar)
      this.showStatus(tempString)
      if (this.answer.indexOf(tempString)==0){
        if (this.answer==tempString){
          this.currentLevel+=1
          this.mode=="waiting"
          setTimeout(()=>{
            this.startLevel()
          },1000)
        }
        //+=keep userInput
        //if wrong, restart
        this.userInput += inputChar 
      }else{
        this.currentLevel=0
        this.mode=="reset"
        setTimeout(()=>{
          this.startLevel()
        },1000)
      }
    }
  }
  //decide the time to callout allon or off
  //tempstring => what user input for now
  //d=>data, i=>index
  Game.prototype.showStatus = function(tempString){
    $(".inputStatus").html("")
    this.answer.split("").forEach((d,i)=>{
      let circle = $("<div class='circle'></div>")
      if(i<tempString.length){
        circle.addClass("correct")
      }
      $(".inputStatus").append(circle)
    })
    if (tempString == this.answer){
      $(".inputStatus").addClass("correct")
      this.showMessage("Correct!")
      setTimeout(()=>{
        this.blocks.turnOnAll()
        this.blocks.playSet("correct")
      },500)
    }else{
      $(".inputStatus").removeClass("correct")
    }

    //turn the light off when it's ""
    if (tempString===""){
      this.blocks.turnOffAll()
    }
    
    if (this.answer.indexOf(tempString)!=0){
      this.showMessage("Wrong...")
      $(".inputStatus").addClass("wrong")
      this.blocks.turnOnAll()
      this.blocks.playSet("wrong")
    }else{
      $(".inputStatus").removeClass("wrong")
      
    }
  }
  
  //--------------------
  //  start a new game
  //start another game, 1 sec after
  var game = new Game()
  setTimeout(function(){
    game.startLevel()
  },1000)
