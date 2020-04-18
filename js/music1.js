//--------------------------------
//          方塊物件
//--------------------------------
var Blocks = function(blockAssign,setAssign){
    this.allOn=false
    this.blocks=blockAssign.map((d,i)=>
      ({
        name: d.name,
        el: $(d.selector),
        audio: this.getAudioObject(d.pitch) 
      })
    )
    this.soundSets = setAssign.map((d,i)=>
      ({
        name: d.name,
        sets: d.sets.map((pitch)=>this.getAudioObject(pitch))
      })
    )
  }
  //閃爍單一方塊＋聲音(方塊名)
  Blocks.prototype.flash=function(note){
    let block = this.blocks.find(d=>d.name==note)
    if (block){
      block.audio.currentTime=0
      block.audio.play()
      block.el.addClass("active")
      setTimeout(()=>{
        if (this.allOn==false){
          block.el.removeClass("active")
        }
      },100)
    }
  }
  //點亮所有方塊
  Blocks.prototype.turnOnAll=function(note){
    this.allOn=true
    this.blocks.forEach(d=>{
      d.el.addClass("active")
    })
  }
  //關掉所有方塊
  Blocks.prototype.turnOffAll=function(note){
    this.allOn=false
    this.blocks.forEach(d=>{
      d.el.removeClass("active")
    })
  }
  //取得聲音物件
  Blocks.prototype.getAudioObject=function(pitch){
    return new Audio("https://awiclass.monoame.com/pianosound/set/"+ pitch+".wav")
  }
  //播放序列聲音（成功/失敗...）
  Blocks.prototype.playSet = function(type){
    this.soundSets
      .find(set => set.name==type).sets
      .forEach(o=>{
        o.currentTime=0
        o.play()
      })
  }
  
  //--------------------------------
  //          遊戲物件
  //--------------------------------
  var Game = function (){
    //定義關卡
    this.blocks = new Blocks(
      [
        {selector: ".block1", name: "1", pitch: "1"},
        {selector: ".block2", name: "2", pitch: "2"},
        {selector: ".block3", name: "3", pitch: "3"},
        {selector: ".block4", name: "4", pitch: "4"},
        {selector: ".block5", name: "5", pitch: "5"},
        {selector: ".block6", name: "6", pitch: "6"},
        {selector: ".block7", name: "7", pitch: "7"}
      ],
      [
        {name: "correct", sets: [1,3,5,8] },
        {name: "wrong", sets: [2,4,5.5,7] }
      ]
    )
    this.levels = [
      "1234567",
      "12324",
      "231234",
      "41233412",
      "41323134132",
      "2342341231231423414232"
    ]
    let _this = this
    //下載關卡
    // $.ajax({
    //   url: "https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata",
    //   success: function(res){
    //     _this.levels = res
    //   }
    // })
    //設定現在在的關卡跟播放間隔
    this.currentLevel = 0
    this.playInterval = 400
    this.mode="waiting"
  }
  //開始關卡
  Game.prototype.startLevel = function(){
    // console.log("start Level "+ this.currentLevel)
    this.showMessage("Level "+ this.currentLevel)
    this.startGame(this.levels[this.currentLevel])
  }
  //顯示訊息
  Game.prototype.showMessage = function(message){
    console.log(message)
    $(".status").text(message)
  }
  //開始遊戲（答案）
  Game.prototype.startGame = function(answer){
    this.mode="gamePlay"
    this.answer = answer
    let notes = this.answer.split("")
    let _this = this
    
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
  //播放音符
  Game.prototype.playNote = function(note){
    console.log(note)
    this.blocks.flash(note)  
  }
  //開始輸入模式
  Game.prototype.startUserInput = function(){
    this.userInput = ""
    this.mode="userInput"
  }
  //使用者輸入
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
  //顯示回答狀態
  Game.prototype.showStatus = function(tempString){
    $(".inputStatus").html("")
    this.answer.split("").forEach((d,i)=>{
      var circle = $("<div class='circle'></div>")
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
    if (tempString==""){
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
  //     開新遊戲
  var game = new Game()
  setTimeout(function(){
    game.startLevel()
  },1000)