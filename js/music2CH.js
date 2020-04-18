//--------------------------------
//          方塊物件
//--------------------------------
 // 方塊所有的資料,播放的聲音特效的集合
let Blocks = function(blockAssign,setAssign){ //（方塊所有資料，播放音效成功或失敗的集合）
    this.allOn=false // 是不是全亮
  //()=>數值 {}=>物件 d=>data
  //array.map(function(currentValue, index, arr), thisValue)
  //想抓到block變成另個物件data=d, index=i
      //然後才能寫亮起來後的動作
    this.blocks=blockAssign.map((d,i)=>
      ({
        name: d.name,
        el: $(d.selector),  //el, element
      //3.聲音：用url播放，但我們也想將它處理成資料集
        audio: this.getAudioObject(d.pitch) //把聲音加入
      })
    )
    //希望新增一個物件 會等於指定進來的資料
    this.soundSets = setAssign.map((d,i)=>
      ({
        name: d.name, //資料中的name屬性
        sets: d.sets.map((pitch)=>this.getAudioObject(pitch))
      })
    )
  }
  //閃爍單一方塊＋聲音(方塊名)
//我希望這個flash傳進去後，就可以播放對應的音和方塊（1.閃爍）
  Blocks.prototype.flash=function(note){
    //傳進去音符後，播放對應名稱的方塊 
      // 要在這個blockdata轉換完這個blocks裡面找到
      // 同一個名稱的方塊 並且做播放的話 就必須要用find 
      // 找到array裡面第一個物件
    let block = this.blocks.find(d=>d.name==note)
    if (block){ //如果這個方塊存在，就會亮起來
      block.audio.currentTime=0
      block.audio.play()
      //使其亮起來又關掉，就是用js加上active
      block.el.addClass("active")  
      //指向外側的block本體
      //在ＪＳ裡面做移除，才不會還沒移除完就又有了之類的問題
      setTimeout(()=>{
        //不是全亮的時候，就remove掉，才不會出現缺角
        if (this.allOn==false){
          block.el.removeClass("active") //把active class 移除
        }
      },100) //延緩100毫秒後再移除
    }
  }
  //點亮所有方塊
//延伸1.閃爍，讓所有的方塊都可以變暗變亮
//為何我們要紀錄allOn and allOff?
  Blocks.prototype.turnOnAll=function(note){
    this.allOn=true //需使用一個變數來記錄狀態
    //因為希望全亮優先於點擊這個單一的動作
  
    //把每個東西都抓出來forEach {}代表執行
    this.blocks.forEach(d=>{
      //抓el這個元素出來，然後都叫active
      d.el.addClass("active")
        //console=>blocks.turnAllOn()會四個全亮
    })
  }
  //關掉所有方塊
  Blocks.prototype.turnOffAll=function(note){
    this.allOn=false  //需使用一個變數來記錄狀態
  //把每個東西都抓出來forEach {}代表執行
    this.blocks.forEach(d=>{
      //抓el這個元素出來，然後都叫active
      d.el.removeClass("active")
      //console=>blocks.turnAllOff()會四個全暗
    })
  }
  //取得聲音物件
  Blocks.prototype.getAudioObject=function(pitch){
    return new Audio("https://awiclass.monoame.com/pianosound/set/"+ pitch+".wav")
  }
  //播放序列聲音（成功/失敗...）
//播放全部特效音的function
  Blocks.prototype.playSet = function(type){
    //針對set裡面的東西做播放 找到對應資料
    // let sets=this.soundSets.find(set=>set.name===type).sets
    // sets.forEach((obj)=>{
    //   obj.currentTime=0
    //   obj.play()
    // })
    this.soundSets  
      .find(set => set.name==type).sets
        //每個都抓出來
      .forEach(o=>{
        o.currentTime=0
        o.play()
      })
  }
  
  //--------------------------------
  //          遊戲物件
  //--------------------------------
//開啟遊戲
  let Game = function (){
    //定義關卡
    // 方塊想準備三個屬性：：指定的元素,名字是,音高是？
    this.blocks = new Blocks(
      [ //設定音調
        {selector: ".block1", name: "1", pitch: "1"},
        {selector: ".block2", name: "2", pitch: "2"},
        {selector: ".block3", name: "3", pitch: "3"},
        {selector: ".block4", name: "4", pitch: "4"}
      ],
      [  //增加遊戲音效
        {name: "correct", sets: [1,3,5,8] },
        {name: "wrong", sets: [2,4,5.5,7] }
      ]
    )
    //設定幾個就有幾關
    this.levels = [
      "1234",
      "12324",
      "231234",
      "41233412",
      "41323134132",
      "2342341231231423414232"
    ]
    let _this = this
    //下載關卡
    $.ajax({  //從下面這個網址ＡＰＩ抓
      url: "https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata",
       //資料抓成功後呼叫一個f
      success: function(res){
        //然後指定給本game的本體
        _this.levels = res
      }
    })
    //設定現在在的關卡跟播放間隔
    //現在的關卡是哪個以及螢幕間隔 我現在在遊戲的什麼狀態內
    this.currentLevel = 0
    this.playInterval = 400
    this.mode="waiting"
  }
  
  //這邊直接放在上面了
  //通常遊戲不會直接寫在這裡，會寫在ajax內
  //呼叫ajax然後從這裡抓
  // Game.prototype.loadLevels = function(){
  //   let _this = this
  //   $.ajax({
  //     //指向自己
  //     url:"https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata",
  //     success: function(res){   //關卡接回來這個資料，指定給game的本體
  //       _this.levels = res
  //     }
  //   })
  // }
//console=> game.loadLevels() =>已抓回  


  //開始關卡
  Game.prototype.startLevel = function(){
    // console.log("start Level "+ this.currentLevel)
    this.showMessage("Level "+ this.currentLevel)
    //我去抓這個關卡的資料，餵給這個關卡資料
    this.startGame(this.levels[this.currentLevel])
  }
  //顯示訊息
  Game.prototype.showMessage = function(message){
    console.log(message)
    $(".status").text(message)
  }
  //開始遊戲（答案）
  //遊戲會自己先執行一次問題，然後再告訴使用者換你惹
  Game.prototype.startGame = function(answer){
    this.mode="gamePlay" //1234我們要拆成陣列模式
  //console=> "1234".split("") 一個一個離出來
  //["1","2","3","4"]
    //直到陣列是空的的時候，就讓使用者開始輸入
    this.answer = answer
    let notes = this.answer.split("")
    //傳回的計時器的變化
    let _this = this
    //讓圈圈在開始遊戲時也顯示，但不會被塗滿所以要先空字串
    this.showStatus("")
    //this.timer 傳回來的計時器的變化
    this.timer = setInterval(function(){
      //從前面推出播放 然後檢查是否已結束 char：取出的數字
    //.shift 從前面取出
      let char = notes.shift()
      //要播放的清單已歸零
      if (!notes.length){
        clearInterval(_this.timer)
        _this.startUserInput() //輸入正確才會顯示幹得好
      }
      _this.playNote(char)
    },this.playInterval)  // 400毫秒
  }
  //播放音符 使其閃爍的是同個方塊
  Game.prototype.playNote = function(note){
    console.log(note)
    this.blocks.flash(note)
  }
  //開始輸入模式
//1.每次輸入時，要有一個變數,暫存使用者輸入的順序＝空字串“”
//2.切換模式，讓使用者知道現在可以輸入了
  Game.prototype.startUserInput = function(){
    this.userInput = ""
    this.mode="userInput"
  }
  //使用者輸入
//使用者每輸入一個數值時，就要＋到之前的字串上比對是否正確
  Game.prototype.userSendInput = function(inputChar){
    //檢查現在是否是使用者可輸入的模式
    if (this.mode=="userInput"){
       //新增一個暫時的字串來存 使用者輸入的集合＋按下的按鍵
      let tempString = this.userInput + inputChar
       //播放使用者按下去的方塊
      this.playNote(inputChar)
    //讓showstatus在每次暗的時候都會去呼叫更新（才會顯示圈圈
      this.showStatus(tempString)
        //比對的邏輯
      if (this.answer.indexOf(tempString)==0){
          //如果完全答對
        if (this.answer==tempString){
           //正確的話 顯示正確並且前往下一關
          this.currentLevel+=1
           //到下一關後要變更mode 才會停止接收使用者輸入的值
          this.mode=="waiting"
          //按完之後，停一秒再開始下一關
          setTimeout(()=>{
            this.startLevel()
          },1000)
           // console.log("correct")
        }
        this.userInput += inputChar //才會持續累積使用者輸入的值
      }else{
        this.currentLevel=0
        this.mode=="reset"
        setTimeout(()=>{
          this.startLevel()
        },1000)
         //答錯的話
      // console.log("wrong")
      //重新開始遊戲
      }
    }
  }
  //顯示回答狀態
//決定呼叫全亮全暗的時機＆下方有點點顯示關卡
//譬如錯了就全紅
//tempstring 現階段使用者輸入 暫存的值
  Game.prototype.showStatus = function(tempString){
    //要把上一回的檔案先清掉
    $(".inputStatus").html("")
    //根據檔案長度，決定增加多少要點擊的音符圈圈在內
    //d=>data, i=>index
    this.answer.split("").forEach((d,i)=>{
      var circle = $("<div class='circle'></div>")
      if(i<tempString.length){
        circle.addClass("correct")
      }
      $(".inputStatus").append(circle)
    })
  //如果全部正確就變成藍色 全錯就紅 
    //如果使用者輸入的temp跟正確一樣
    if (tempString == this.answer){
      $(".inputStatus").addClass("correct")
      this.showMessage("Correct!")
      //正確的話就0.5秒後播放
      setTimeout(()=>{
        this.blocks.turnOnAll()
         //過一段時間後再播放正確的聲音
         //正確時播放正確的聲音
        this.blocks.playSet("correct")
      },500)
    }else{
      $(".inputStatus").removeClass("correct")
    }
    //在傳入的值是""時，先把燈全部關掉
    //不然畫面一直亮著很奇怪XD
    if (tempString==""){
      this.blocks.turnOffAll()
    }
    
    //如果現在使用者輸入的值並不=答案:wrong
    if (this.answer.indexOf(tempString)!=0){
      this.showMessage("Wrong...")
      $(".inputStatus").addClass("wrong")
      //錯誤的框框顯示
      this.blocks.turnOnAll()
      //播放錯誤的群組
      this.blocks.playSet("wrong")
    }else{
       //如果沒有輸入錯誤，也要移除wrong
      $(".inputStatus").removeClass("wrong")
      
    }
  }
  
  //--------------------
  //     開新遊戲
//產生遊戲並開始
  // var game = new Game()
//遊戲產生之後，不要馬上開始，一秒後再開始
  // setTimeout(function(){
  //   game.startLevel()
  // },1000)

// 這個整個範例裡面
// 建立了一個 block 物件
// 控制單獨方塊的閃爍與聲音的播放
// 怎麼樣去播放聲音
// 跟把播放聲音 變成重複利用的資源
// 在 Game 物件裡面
// 定義了遊戲的流程
// 開啟一個新的關卡function
// 定義接收使用者輸入
// 最後新增一個遊戲物件開始執行

// 自己在做這個練習的時候
// 可以去新增更多的方塊
// 用鍵盤可以玩
// 小星星 國歌 老歌