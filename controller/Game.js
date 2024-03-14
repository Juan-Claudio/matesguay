class Game
{   
    static #graphics = {};
    static #operation = {};
    static #isWidthLessThan1000px = false;

    static #already_loaded = false;
    static #saved_url = '';
    
    // *** USEFULL ?? ***
    //static #canvas_width = 1229;
    //static #canvas_height = 819;
    //static #map_cell_size = 16;
    //static #map_width = Math.floor(this.#canvas_width/this.#map_cell_size);
    //static #map_height = Math.floor(this.#canvas_height/this.#map_cell_size);
    static #map = JSON.parse(map_saved_json);
    
    static #op_param = {}; //Map() operations parameters
    static #ai_level = 0; //probability to win election in percent
    static #first_turn = true;
    static #ai_influence_point = 0;

    static #enter_event_allowed=false;
    
    static #phase = "election"; //'election' or 'move'
    static #add = true; //to add onclick(true) or quit onclick(false)
    static #current_election_done = 0;
    static #influence_point = 0;
    static #selected_country="";
    static #clicked_country="";
    static #correct_answer_count = 0;
    static #joker_count = 0; //incremented but not used

    static #current_proposal = new Map([["count",0]]);
    static #current_player = 0;
    static #current_opponent = 0;
    static #current_player_deputies = 0;
    static #current_opponent_deputies = 0;
    
    static #last_input = false;

    static #timer = 0;

    ///!\ CHANGE VARIABLES TO CONSTANTS /!\
    static #influence_penalty = 5;
    static #timer_max = 15;
    static #timer_count = 15;
    static #timer_good_answer = 3;
    static #timer_good_result_answer = 5;
    static #all_country_name = "abcdefghijklmnopqrstuvwxyz0123456789@";
    ////////////////////////////////////////
        
    //countryName => [empire,influence,neighbouring countries, coor_Rect_Zone]
    //empire: 'separatist' // 'matesguay' // 'nomatland'
    //influence: 1-20 (influence points)
    //neighbouring countries: [a-z0-9@]+ string of countries name which is neighbour
    static #all_country_state = new Map([
        ["a", ['separatist',7,"bi","205,150"]],
        ["b", ['separatist',8,"aijc","348,205"]],
        ["c", ['separatist',7,"bjkd","498,174"]],
        ["d", ['separatist',6,"cke","574,107"]],
        ["e", ['separatist',5,"dklf","693,121"]],
        ["f", ['separatist',5,"elg","814,152"]],
        ["g", ['nomatland',10,"flm","961,96"]],
        ["h", ['separatist',6,"in","202,316"]],
        ["i", ['separatist',6,"abjponh","318,310"]],
        ["j", ['separatist',7,"bckqxpi","503,303"]],
        ["k", ['separatist',6,"cdelqj","633,215"]],
        ["l", ['separatist',5,"efgmrqk","813,234"]],
        ["m", ['separatist',5,"lgtr","953,235"]],
        ["n", ['separatist',5,"hiouv","215,441"]],
        ["o", ['separatist',6,"nipw2vu","342,486"]],
        ["p", ['separatist',8,"ijxwo","463,413"]],
        ["q", ['separatist',6,"jklrzyx","706,345"]],
        ["r", ['separatist',6,"qlmtsz","865,308"]],
        ["s", ['separatist',7,"zrt","906,346"]],
        ["t", ['separatist',6,"srm","1002,329"]],
        ["u", ['matesguay',10,"nov0","200,600"]],
        ["v", ['separatist',5,"unow210","329,615"]],
        ["w", ['separatist',6,"opx32v","478,543"]],
        ["x", ['separatist',7,"pjqy43w","588,476"]],
        ["y", ['separatist',7,"xqz4","680,408"]],
        ["z", ['separatist',7,"yqrs7654","802,409"]],
        ["0", ['separatist',5,"uv1","289,745"]],
        ["1", ['separatist',5,"0v2","428,714"]],
        ["2", ['separatist',6,"1vow3","476,636"]],
        ["3", ['separatist',8,"2wx458","584,600"]],
        ["4", ['separatist',8,"xyz53","707,477"]],
        ["5", ['separatist',8,"834z6","789,568"]],
        ["6", ['separatist',8,"5z7@9","892,552"]],
        ["7", ['separatist',8,"z6@","942,482"]],
        ["8", ['separatist',9,"35","692,670"]],
        ["9", ['separatist',9,"6@","926,663"]],
        ["@", ['separatist',9,"967","1015,563"]],
    ]);
    
    constructor()
    {
        if(this.constructor==Game)
        {
            throw new Error("Game is not instanciable.");
        }
    }

    /***************/
    /**** TOOLS ****/
    /***************/

    static #viewport_size()
    {
        let width = screen.width;
        let height = screen.height;
        return [width,height];
    }
    
    /**
     * Return coordinates of mouse on window.event
     * relative to the id's element
     * @param {string} game_canvas_id 
     * @returns {[]} [x,y]
     */
    static #coordinate_clicked(game_canvas_id)
    {
        let mouseCoor = [0,0];
        mouseCoor[0] = window.event.clientX - document.getElementById(game_canvas_id).offsetLeft + window.pageXOffset;
        mouseCoor[1] = window.event.clientY - document.getElementById(game_canvas_id).offsetTop + window.pageYOffset;

        let x=Math.floor(mouseCoor[0]);
        let y=Math.floor(mouseCoor[1]);

        return [x,y];
    }

    /**
     * Decrypt url get data and put it in 2 Game object variables
     */
    static #url_param_decode(url_param='no_param')
    {
        let param_ai_code = '';
        if(url_param!='no_param')
        {
            //part of url with the 2 GET variables (loaded game)
            param_ai_code = url_param;
        }
        else
        {
            //part of url with the 1 or 2 GET variables
            param_ai_code = document.location.href.split("?")[1];
        }


        //check loaded game and load it if true
        if(param_ai_code.split("=")[0]=='load' && !this.#already_loaded)
        {
            let all_cookies = document.cookie.split("; ");
            let game_data = '';
            for(let cook of all_cookies)
            {
                if(/saved_game=/.test(cook))
                {
                    game_data = cook.replace("saved_game=","");
                    break;
                }
            }

            if(game_data=='')
            {
                alert("No tienes una partida guardada.");
                document.location.href = '../index.html';
            }
            else
            {
                Game.load(game_data);
            }
            this.#already_loaded = true;
            return;
        }

        //save url variables for futur load
        this.#saved_url = param_ai_code;

        /*divide the GET variables part in two
        * first: all operation parameters
        * second: computer propability to win
        */
        param_ai_code = param_ai_code.split("&");
        //computer propability to win in var (string)
        let ai_percent = param_ai_code[1].split("=")[1];
        //encoded all operation parameters
        let param_code = param_ai_code[0].split("=")[1];
        param_code = param_code.replace('%C3%97','×');
        //separate the different operation sign parameters
        param_code = param_code.split("]");
        /*
        * for loop description:
        * before: ['+_xAxfxRxvxTxdxHx', '×_xAxfxRxvxTxdxHx']
        * 1) [['+','xAxfxRxvxTxdxHx'], ['×','xAxfxRxvxTxdxHx']]
        * 2) [['+','xaxaxaxaxaxaxax'], ['×','xaxaxaxaxaxaxax']]
        * 3) [['+',['x','x','x','x','x','x','x','x']], ['×',['x','x','x','x','x','x','x','x']]]
        * 4) [['+',[x,x,x,x,x,x,x,x]], ['×',[x,x,x,x,x,x,x,x]]]
        */
        for(let i=0;i<param_code.length;i++)
        {
            //1)
            param_code[i] = param_code[i].split("_");
            //2)
            param_code[i][1] = param_code[i][1].replace(/[a-zA-Z]/g,"a");
            //3)
            param_code[i][1] = param_code[i][1].split("a");
            //4)
            for(let j=0; j<param_code[i][1].length; j++)
            {
                param_code[i][1][j] = parseInt(param_code[i][1][j]);
            }
        }
        /*convert
        * [['+',[x,x,x,x,x,x,x,x]], ['×',[x,x,x,x,x,x,x,x]]]
        * into Map()
        * '+':[x,x,x,x,x,x,x,x], '×':[x,x,x,x,x,x,x,x]
        */
        this.#op_param = new Map(param_code);
        //computer propability to win in object var (int)
        this.#ai_level = parseInt(ai_percent);
    }

    /** =>Math_tools.randint() better
     * return random int value between
     * lower and higher (both include)
     * @param {int} lower 
     * @param {int} higher 
     * @returns {int}
     */
    static #random_int(lower=0,higher=10)
    {
        if(lower==0)
        {
            return Math.floor(Math.random()*(higher+1));
        }
        return Math.floor(Math.random()*(higher-(lower-1)))+lower;
    }

    /************************/
    /**** INITIALIZATION ****/
    /************************/
    
    /**
     * Initialization of game
     * 1/Pick up GET data of url
     * 2/Create Operation object with user choosen parameters
     * 3/Create Graphics object with id introduced by user and countries name
     * 4/Set events
     * @param {string} game_canvas_id id of dom object canvas
     */
    static init(game_canvas_id)
    {
        //screen param
        this.#isWidthLessThan1000px = this.#viewport_size()[0]<=1000 && this.#viewport_size()[1]<=1000;
        if(this.#isWidthLessThan1000px)
        {
            $("#congress").attr('width','455');
            $("#congress").attr('height','376');
        }

        this.#url_param_decode();
        //if loaded game -> Game.load() create the Operation object
        if(!this.#already_loaded)
        {
            this.#operation = new Operation(this.#op_param);
        }
        this.#graphics = new Graphics(game_canvas_id, this.#all_country_name, this.#all_country_state);
        this.#events(game_canvas_id);
    }

    /**
     * set all event of the game
     * @param {string} game_canvas_id 
     */
    static #events(game_canvas_id)
    {
        //mouse pointer only on country
        $("#"+game_canvas_id).on("mousemove",()=>{
            let coor = this.#coordinate_clicked(game_canvas_id);
            
            //convert pixel coor in cell coor of map_saved
            coor[0] = Math.floor(coor[0]/16);
            coor[1] = Math.floor(coor[1]/16);
            
            //if pointer is out of the map
            if(coor[0]>75 || coor[1]>50){return;}

            if(this.#map[coor[0]][coor[1]]!="-")
            {
                $("#"+game_canvas_id).css("cursor","pointer");
            }
            else
            {
                $("#"+game_canvas_id).css("cursor","auto");
            }
        });

        //on click selection of countries
        $("#"+game_canvas_id).click(()=>{
            let coor = this.#coordinate_clicked(game_canvas_id);
            
            //console.info(coor[0]+","+coor[1]);
            
            coor[0] = Math.floor(coor[0]/16);
            coor[1] = Math.floor(coor[1]/16);

            //ELECTION PHASE
            if(this.#phase=="election")
            {
                //if country name is not "-" (no country)
                if(this.#map[coor[0]][coor[1]]!="-")
                {
                    //DATA part
                    this.#select_country( this.#map[coor[0]][coor[1]] );
                    this.#participate_in_vote( this.#map[coor[0]][coor[1]] );

                    //Graphics part
                    this.#graphics.redraw( this.#all_country_state, this.#selected_country );
                }
            }
            //MOVE PHASE
            else if(this.#phase=="move")
            {
                let clicked_country = this.#map[coor[0]][coor[1]];
                
                //if no remaining point
                if(this.#influence_point<1 && this.#add)
                {
                    alert("No tenemos más influencia que repartir");
                    return;
                }
                //if no country in clicked zone
                if(clicked_country=="-")
                {
                    return;
                }
                //if no player country cliqued
                if(this.#all_country_state.get(clicked_country)[0]!="matesguay")
                {
                    return;
                }

                let influence_points = this.#all_country_state.get(clicked_country)[1];
                
                console.log("CLICKED COUNTRY: "+clicked_country);

                if(this.#add)
                {
                    //onclick se añade uno en el país pulsado
                    if(influence_points<23)
                    {
                        this.#influence_point--;
                        this.#all_country_state.get(clicked_country)[1]++;
                    }
                    else
                    {
                        alert("Tenemos el máximo de influencia aquí.");
                    }
                }
                else
                {
                    //onclick se quita uno en el país pulsado si total>1
                    if(influence_points>1)
                    {
                        this.#all_country_state.get(clicked_country)[1]--;
                        this.#influence_point++;
                    }
                    else
                    {
                        alert("No se puede tener menos de 1 en un país nuestro.");
                    }
                }
                this.#graphics.redraw(this.#all_country_state, this.#selected_country);
                $("#popularityScoreGain").text(this.#influence_point);
            }
        });

        //on click 'ok' influence share
        $("#validate_share_influence").click(()=>{
            let left_influence = parseInt($("#left_influence_points").text());
            let right_influence = parseInt($("#right_influence_points").text());
            if(left_influence>0 && right_influence>0)
            {
                $("#share_influence").css("display","none");
                $("#lock_back").css("display","none");
                $("#right_influence_points").text("0");

                //unselect country
                this.#selected_country="";
            
                //redraw map
                this.#graphics.redraw(this.#all_country_state, this.#selected_country);

                this.#win_lose();
                this.#end_of_turn();
            }
            else
            {
                alert("No se puede dejar menos de 1 punto en un país nuestro.");
            }
            Game.save();
        });

        //on click '>' influence share
        $("#right_more_influence").click(()=>{
            let left_influence = this.#all_country_state.get(this.#selected_country)[1];
            let right_influence = this.#all_country_state.get(this.#clicked_country)[1];
            if(left_influence>1)
            {
                left_influence--;
                this.#all_country_state.get(this.#selected_country)[1]=left_influence;
                $("#left_influence_points").text(left_influence);

                right_influence++;
                this.#all_country_state.get(this.#clicked_country)[1]=right_influence;
                $("#right_influence_points").text(right_influence);
            }
            else
            {
                alert("No se puede dejar menos de 1 punto en un país nuestro.");
            }
        });

        //on click '<' influence share
        $("#left_more_influence").click(()=>{
            let left_influence = this.#all_country_state.get(this.#selected_country)[1];
            let right_influence = this.#all_country_state.get(this.#clicked_country)[1];
            if(right_influence>1)
            {
                right_influence--;
                this.#all_country_state.get(this.#clicked_country)[1]=right_influence;
                $("#right_influence_points").text(right_influence);

                left_influence++;
                this.#all_country_state.get(this.#selected_country)[1]=left_influence;
                $("#left_influence_points").text(left_influence);
            }
            else
            {
                alert("No se puede dejar menos de 1 punto en un país nuestro.");
            }
        });

        //on click '+'
        $("#add_btn").click(()=>{
            //data
            this.#add=true;

            //graphics
            $("#add_btn").css({
                'color':'#fff',
                'background-color':'rgba(0,255,0,0.1)',
            });
            $("#quit_btn").css({
                'color':'#aaa',
                'background-color':'#6e6651',
            });
        });

        //on click '-'
        $("#quit_btn").click(()=>{
            //data
            this.#add=false;

            //graphics
            $("#add_btn").css({
                'color':'#aaa',
                'background-color':'#6e6651',
            });
            $("#quit_btn").css({
                'color':'#fff',
                'background-color':'rgba(0,255,0,0.1)',
            });
        });

        //on click 'fin turno'
        $("#endTurn_influencia").click(()=>{
            if(this.#phase=="election")
            {
                //data
                this.#current_election_done=4;
                this.#end_of_turn();
                this.#selected_country="";
                this.#graphics.redraw(this.#all_country_state, this.#selected_country);
            }
            else if(this.#phase=="move")
            {
                //data
                this.#phase="election";

                //graphics
                $("#endTurn_influencia").text('Fin Turno');
            }
        });

        //on click virtual keyboard digit
        for(let i = 0 ; i<10 ; i++)
        {
            $("#key"+i).click(()=>{
                this.#keyboard_event(48+i);
            });
        }

        //on click virtual ok
        $("#key_ok").click(()=>{
            this.#keyboard_event(13);
        });

        //on click virtual erase_back
        $("#back_erase").click(()=>{
            this.#keyboard_event(8);
        });

        //on click virtual erase_all
        $("#erase_all").click(()=>{
            this.#keyboard_event(46);
        });

        //on click virtual left_key
        $("#left_key").click(()=>{
            this.#keyboard_event(37);
        });

        //onkeyup answer
        //NOT WORKING
        $(document.body).on('keyup',(e)=>{
            let key_code = e.which;
            this.#keyboard_event(key_code);
        });
    }

    static #keyboard_event(key)
    {
        let content = "";
        switch(key)
            {
                //enter key
                case 13:
                    if(this.#enter_event_allowed)
                    {
                        //if two boxes to fill
                        if(this.#current_proposal.get('type')=="result")
                        {
                            //if left box selected
                            if(this.#last_input==false)
                            {
                                //only select right box
                                this.#last_input=true;
                                
                                //graphics part
                                $("#nb1").css({
                                    "color":"#fff",
                                    'border-color':'#fff',
                                });
                                $("#nb2").css({
                                    "color":"#ff0000",
                                    'border-color':'#ff0000',
                                });

                                return;
                            }
                        }
                        //else, validate answer
                        let count = this.#current_proposal.get("count");
                        count--;
                        this.#current_proposal.set("count",count);
                        this.#answer(
                            parseInt($('#nb1').text()),
                            parseInt($('#nb2').text()),
                            parseInt($('#result').text())
                        );
                        this.#last_input=false;
                    }
                    break;
                //Numeric keys
                case 96:
                case 97:
                case 98:
                case 99:
                case 100:
                case 101:
                case 102:
                case 103:
                case 104:
                case 105:
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                    let digit_key = 0;

                    //empty filled boxes with '?'
                    if($("#nb1").text()=="?"){ $("#nb1").text(''); }
                    if($("#nb2").text()=="?"){ $("#nb2").text(''); }
                    if($("#result").text()=="?"){ $("#result").text(''); }

                    //find the pressed digit
                    if(key<96)
                    {
                        digit_key = key-48;
                    }
                    else
                    {
                        digit_key = key-96;
                    }

                    if(this.#current_proposal.get("type")=="result")
                    {
                        if(this.#last_input)
                        {
                            content = $("#nb2").text();
                            $("#nb2").text(content+digit_key);
                        }
                        else
                        {
                            content = $("#nb1").text();
                            $("#nb1").text(content+digit_key);
                        }
                    }
                    else if(this.#current_proposal.get("type")=="standard")
                    {
                        content = $("#result").text();
                        $("#result").text(content+digit_key);
                    }
                    else
                    {
                        content = $("#nb2").text();
                        $("#nb2").text(content+digit_key);
                    }
                    break;
                //suppr. key
                case 46:
                    if(this.#current_proposal.get("type")=="result")
                    {
                        if(this.#last_input)
                        {
                            $("#nb2").text('');
                        }
                        else
                        {
                            $("#nb1").text('');
                        }
                    }
                    else if(this.#current_proposal.get("type")=="standard")
                    {
                        $("#result").text('');
                    }
                    else
                    {
                        //content = $("#nb2").text();
                        $("#nb2").text('');
                    }
                    break;
                //back key
                case 8:
                let id = '';
                if(this.#current_proposal.get("type")=="result")
                    {
                        if(this.#last_input)
                        {
                            id="nb2";
                        }
                        else
                        {
                            id="nb1";
                        }
                    }
                    else if(this.#current_proposal.get("type")=="standard")
                    {
                        id="result";
                    }
                    else
                    {
                        id="nb2";
                    }
                    content = $("#"+id).text();
                    content = content.substring(0,content.length-1);
                    $("#"+id).text(content);
                    break;
                //left key
                case 37:
                    if(this.#last_input)
                    {
                        //data part
                        this.#last_input = false;

                        //graphics part
                        $("#nb1").css({
                            "color":"#ff0000",
                            'border-color':'#ff0000',
                        });
                        $("#nb2").css({
                            "color":"#fff",
                            'border-color':'#fff',
                        });
                    }
                    break;
                //right key
                case 39:
                    if(!this.#last_input)
                    {
                        //data part
                        this.#last_input = true;

                        //graphics part
                        $("#nb1").css({
                            "color":"#fff",
                            'border-color':'#fff',
                        });
                        $("#nb2").css({
                            "color":"#ff0000",
                            'border-color':'#ff0000',
                        });
                    }
                    break;
                /*default:
                    console.log(key);
                    break;*/
            }
    }

    static save()
    {
        let coded_save = "";
        let coded_empire = "";
        //cookie expires one year later
        let exp1year = new Date();
        exp1year.setTime(exp1year.getTime()+(365*24*3600*1000));
        exp1year = exp1year.toUTCString();

        //save all countries state
        this.#all_country_state.forEach((val,key)=>{
            if(val[0]=='separatist'){ coded_empire='S'; }
            else if(val[0]=='matesguay'){ coded_empire='M'; }
            else{ coded_empire='N'; }
            coded_save += key+"%"+coded_empire+"%"+val[1];
            coded_save += "&";
        });
        //remove last '&'
        coded_save = coded_save.substring(0,coded_save.length-1); 
        coded_save += '#';        
        coded_save += this.#saved_url+'#'; //op_param+ai_level
        coded_save += this.#first_turn+'#';
        coded_save += this.#ai_influence_point+'#';
        coded_save += this.#enter_event_allowed+'#';
        coded_save += this.#phase+'#';
        coded_save += this.#add+'#';
        coded_save += this.#current_election_done+'#';
        coded_save += this.#influence_point+'#';
        coded_save += this.#selected_country+'#';
        coded_save += this.#clicked_country+'#';
        coded_save += this.#correct_answer_count;

        //save in cookie named 'saved_game'
        document.cookie='saved_game='+coded_save+';SameSite=Lax;expires='+exp1year+';path=/;';
    }

    static load(save)
    {
        let save_ar = save.split("#");
        let countries_state = save_ar[0].split("&");
        let url = save_ar[1];
        this.#saved_url = url; //save this part to futur saving
        let curr_country = [];
        let new_val = [];

        //reinit operations memory
        this.#current_proposal = new Map([["count",0]]);
        this.#current_player = 0;
        this.#current_opponent = 0;
        this.#current_player_deputies = 0;
        this.#current_opponent_deputies = 0;
        this.#last_input = false;
        this.#timer = 0;

        //load all countries state
        for(let i=0; i<countries_state.length;i++)
        {
            curr_country = countries_state[i].split("%");
            if(curr_country[1]=="S"){ curr_country[1]='separatist'; }
            else if(curr_country[1]=="M"){ curr_country[1]='matesguay'; }
            else{ curr_country[1]='nomatland'; }
            new_val = this.#all_country_state.get(curr_country[0]);
            new_val[0]=curr_country[1];
            new_val[1]=parseInt(curr_country[2]);
            this.#all_country_state.set(curr_country[0],new_val);
        }

        //load operations parameters
        Game.#url_param_decode(url);
        this.#operation = new Operation(this.#op_param);
        //this.#operation.load(this.#op_param);
        
        //load the others variables of game
        this.#first_turn=(save_ar[2]=="true") ? true : false;
        this.#ai_influence_point=parseInt(save_ar[3]);
        this.#enter_event_allowed=(save_ar[4]=="true") ? true : false;
        this.#phase=save_ar[5];
        this.#add=(save_ar[6]=="true") ? true : false;
        this.#current_election_done=parseInt(save_ar[7]);
        this.#influence_point=parseInt(save_ar[8]);
        this.#selected_country=save_ar[9];
        this.#clicked_country=save_ar[10];
        this.#correct_answer_count=parseInt(save_ar[11]);

        $("#nbEleccionRestante").text(5-this.#current_election_done);

        //refresh game (no refresh because creation of all objects of the game after)
        //this.#graphics.redraw(this.#all_country_state, this.#selected_country);
    }

    
    /**********************/
    /**** INTERACTIONS ****/
    /**********************/

    /**
     * put the country name in variable 'selected'
     * if is player country with more than 1 influence point
     * put "" in variable 'selected' if country now selected
     * @param {string} clicked_country one letter/digit/'@'
     */
    static #select_country(clicked_country)
    {
        //if clicked country is player's country
        if(this.#all_country_state.get(clicked_country)[0]=="matesguay")
        {
            //if less than 2 influence points in clicked country
            if(this.#all_country_state.get(clicked_country)[1]>1)
            {
                //if clicked country is not yet selected
                if(this.#selected_country!=clicked_country)
                {
                    this.#selected_country = clicked_country;
                }
                else
                {
                    this.#selected_country = "";
                }
            }
            else
            {
                alert("Este país no tiene bastante influencia.");
            }
        }
    }
    
    /**
     * return true o false if is border country
     * if false display alert() message
     * @param {string} selected_country one character
     * @param {string} clicked_country //
     * @returns 
     */
    static #is_neighboring_country(selected_country, clicked_country)
    {
        if(selected_country==""){return;}
        let border_country = this.#all_country_state.get(selected_country)[2];
        for(let i = 0; i<border_country.length; i++)
        {
            if(clicked_country == border_country[i])
            {
                return true;
            }
        }
        alert("No es un país vecino del país seleccionado.");
        return false;
    }
    
    /**
     * check if is vote
     * activate/draw vote phase
     * @param {string} clicked_country 
     */
    static #participate_in_vote(clicked_country)
    {
        //if clicked country is not a player's country
        if(this.#all_country_state.get(clicked_country)[0]!="matesguay")
        {
            //if this country is neighboring country
            if(this.#is_neighboring_country(this.#selected_country, clicked_country))
            {
                //if a player country is selected
                if(this.#selected_country!="")
                {
                    //if mobile/tablet
                    if(this.#isWidthLessThan1000px)
                    {
                        $("html").scrollLeft(0);
                        $("html").scrollTop(0);
                        //open virtual touch keyboard
                        $("#left_touch_keyboard, #right_touch_keyboard").css('display','block');
                    }
                    
                    this.#enter_event_allowed=true; //activation of enter key

                    this.#next_proposal('new');

                    //console.log(this.get_proposal());

                    this.#clicked_country = clicked_country;
                    this.#current_player = this.#all_country_state.get(this.#selected_country)[0];
                    this.#current_opponent = this.#all_country_state.get(clicked_country)[0];
                    this.#current_player_deputies = this.#all_country_state.get(this.#selected_country)[1];
                    this.#current_opponent_deputies = this.#all_country_state.get(clicked_country)[1];
                    
                    //open congress vote window with operation
                    this.#draw_congress_vote();
                    
                    //set timer
                    this.#timer = setInterval(()=>{
                        Game.#timer_count--;
                        if(Game.#timer_count<5){ console.log(Game.#timer_count); } //change to user display
                        if(Game.#timer_count==0)
                        {
                            Game.#timer_count = Game.#timer_max;
                            Game.#correct_answer_count = 0;
                            Game.#current_opponent_deputies++;

                            Game.#next_proposal('new');
                            
                            Game.#draw_congress_vote();
                            Game.#last_input=false;

                            alert("Fin del tiempo. El adversario gana un diputado.");
                        }
                    },1000);
                }
            }
        }
    }

    /**
     * draw congress vote window
     * using this.#graphics...
     */
    static #draw_congress_vote()
    {
        let all_intervals = new Map();

        this.#op_param.forEach((val,key)=>{
            all_intervals.set(key, Game.#operation.get_operation_intervals(key));
        });

        this.#graphics.draw_congress_vote(
            'test',
            this.#current_proposal,
            all_intervals,
            this.#correct_answer_count,
            this.#current_player,
            this.#current_opponent,
            this.#current_player_deputies,
            this.#current_opponent_deputies,
        );
    }

    static #answer(nb1, nb2, result)
    {
        let influence_point=0;

        //good answer
        if(this.#check_answer(nb1, nb2, result))
        {
            this.#correct_answer_count++;
            switch(this.#correct_answer_count)
            {
                case 15:
                    this.#joker_count++;
                    break;
                case 20:
                    this.#influence_point++;
                    break;
                case 21:
                    this.#correct_answer_count=1;
                    break;
            }

            if(this.#current_proposal.get("type")!="result")
            {
                this.#timer_count += this.#timer_good_answer;
            }
            else
            {
                this.#timer_count += this.#timer_good_result_answer;
            }

            this.#current_player_deputies++;

            //graphic part
            $("#popularityScoreGain").text(this.#influence_point);
        }
        //wrong answer
        else
        {
            this.#correct_answer_count=0;

            this.#current_opponent_deputies++;

            if(this.#current_proposal.get("type")=='result')
            {
                //show good answer only in end of all proposition
            }
            else
            {
                let good_answer_text = "";
                good_answer_text += this.#current_proposal.get('proposal')[0]+" ";
                good_answer_text += this.#current_proposal.get('sign')+" ";
                good_answer_text += this.#current_proposal.get('proposal')[1]+" ";
                good_answer_text += "= "+this.#current_proposal.get('proposal')[2];
                $("#congress_content").append("<div id='good_answer'>"+good_answer_text+"</div>");

                this.#timer_count += 1;

                setTimeout(()=>{ $("#good_answer").remove(); },2000);
            }
        }

        this.#next_proposal(); //new operation asked
        this.#draw_congress_vote();

        if(this.#current_player_deputies>=24)
        {
            this.#enter_event_allowed=false;
            influence_point = this.#all_country_state.get(this.#clicked_country)[1];
            if(influence_point<=this.#influence_penalty)
            {
                this.#all_country_state.get(this.#clicked_country)[1]=0;
                alert("¡Hemos ganado el voto para la integración del país en nuestro imperio!");
                
                //win new territory
                this.#all_country_state.get(this.#clicked_country)[0] = 'matesguay';

                //share influence
                $("#left_influence_points").text(this.#all_country_state.get(this.#selected_country)[1]);
                $("#share_influence").css("display","block");
                $("#lock_back").css("display","block");

                //if mobile/tablet
                if(this.#isWidthLessThan1000px)
                {
                    $("html").scrollLeft(0);
                    $("html").scrollTop(0);
                }
                
                //close operations window
                this.#close_congress();
            }
            else
            {
                this.#all_country_state.get(this.#clicked_country)[1] = influence_point-this.#influence_penalty;
                alert("¡Hemos ganado el voto para más intercambio con nuestro imperio!");
                
                //close operations window
                this.#close_congress();
                this.#end_of_turn();
                this.#selected_country = "";
            }
            //clear interval
            clearInterval(this.#timer);

            //redraw map
            this.#graphics.redraw(this.#all_country_state, this.#selected_country);

            this.#win_lose();

            //quit virtual keyboard
            $("#left_touch_keyboard, #right_touch_keyboard").css('display','none');
        }
        else if(this.#current_opponent_deputies>=24)
        {
            this.#enter_event_allowed=false;
            influence_point = this.#all_country_state.get(this.#selected_country)[1];
            if(influence_point<=this.#influence_penalty)
            {
                this.#all_country_state.get(this.#selected_country)[1]=1;
                alert("¡Este fracaso da ideas de independencia a la nación de esta zona!");
            }
            else
            {
                this.#all_country_state.get(this.#selected_country)[1] = influence_point-this.#influence_penalty;
                alert("¡Este voto perdido baja mucho nuestra influencia en esta zona!");
            }
            this.#close_congress();
            this.#end_of_turn();
            this.#selected_country = "";
            this.#graphics.redraw(this.#all_country_state, this.#selected_country);
            
            this.#win_lose();

            //quit virtual keyboard
            $("#left_touch_keyboard, #right_touch_keyboard").css('display','none');
        }
    }

    static #end_of_turn()
    {
        this.#current_election_done++;
        clearInterval(this.#timer);//for security
        $("#nbEleccionRestante").text(5-this.#current_election_done);
        if(this.#current_election_done==5)
        {
            //graphics
            $("#endTurn_influencia").text('Elecciones');

            //stop enter event
            this.#enter_event_allowed=false;
            
            //turn finish = +1 influence point
            this.#influence_point++;
            //origin country controled +3 influence point
            if(this.#all_country_state.get("u")[0]=="matesguay")
            {
                this.#influence_point +=3 ;
            }
            //+1 influence point for each 3 countries controled
            let bonus = 0;
            this.#all_country_state.forEach((val,key)=>{
                if(val[0]=="matesguay")
                {
                    bonus++;
                }
            });
            this.#influence_point += Math.floor(bonus/3);
            $("#popularityScoreGain").text(this.#influence_point);

            this.#current_election_done=0;
            $("#nbEleccionRestante").text(5-this.#current_election_done);
            this.#phase="move";
            alert("Le toca a Nomatland ahora.");
            $("#lock_back").css("display","block");
            
            this.#ai_turn();
        }
    }

    static #is_ai_loser()
    {
        let loser = true;
        this.#all_country_state.forEach((val,key)=>{
            if(val[0]=="nomatland")
            {
                loser=false;
            }
        });
        return loser;
    }
    
    /**
     * Return list of country of indroduced master
     * @param {string} master name of master (nomatland, separatist...)
     * @returns {string}
     */
    static #all_country_of(master, country_list=this.#all_country_name)
    {
        let ai_country_str_list = "";
        for(let i = 0; i<country_list.length; i++)
        {
            if(this.#all_country_state.get(country_list[i])[0]==master)
            {
                ai_country_str_list += country_list[i];
            }
        }
        return ai_country_str_list;
    }

    /**
     * Return list of country wich comply test
     * @param {string} sign only "<",">" or "="
     * @param {int} valor positive number
     * @param {string} country_list countries name like "flm" default:all countries
     * @returns {string}
     */
    static #all_country_influence(sign, valor, country_list=this.#all_country_name)
    {
        let test = false;
        let country_influence_point = 0;
        let all_country_comply_test = "";

        for(let i = 0; i<country_list.length;i++)
        {
            country_influence_point = this.#all_country_state.get(country_list[i])[1];
            switch(sign)
            {
                case "<":
                    test = country_influence_point<valor;
                    break;
                case "<=":
                    test = country_influence_point<=valor;
                    break;
                case ">":
                    test = country_influence_point>valor;
                    break;
                case ">=":
                    test = country_influence_point>=valor;
                    break;
                case "=":
                    test = country_influence_point==valor;
                    break;
                default:
                    console.error("'"+sign+"' comparaison sign not allowed.");
                    return;
            }
            if(test)
            {
                all_country_comply_test += country_list[i];
            }
        }
        return all_country_comply_test;
    }

    static #all_neighboring_country_to(master, country_list=this.#all_country_name)
    {
        let border_country_list = "";
        let neighboring_country_list = "";
        for(let i = 0; i<country_list.length; i++)
        {
            border_country_list=this.#all_country_state.get(country_list[i])[2];
            
            for(let j = 0; j<border_country_list.length;j++)
            {
                if(this.#all_country_state.get(border_country_list[j])[0]==master)
                {
                    neighboring_country_list += country_list[i];
                    break;
                }
            }
        }

        return neighboring_country_list;
    }

    static #ai_turn()
    {
        //WAITING ANIMATION
        $('#ai_anim').css("display","block");

        //if is game over to nomatland
        if(this.#is_ai_loser())
        {
            setTimeout(()=>{
                $('#ai_anim').css("display","none");
                $('#lock_back').css("display","none");
                alert("Te toca. Fase de organisación de tu influencia");
            },1500);
            return;
        }
        
        //AI MOVE PHASE
        if(this.#first_turn)
        {
            this.#first_turn=false;
        }
        else
        {
            //INFLUENCE GAIN

            let number_of_ai_country = 0;
            this.#all_country_state.forEach((val, key)=>{
                if(val[0]=="nomatland")
                {
                    number_of_ai_country++;
                }
            });
            this.#ai_influence_point++;
            this.#ai_influence_point += Math.floor(number_of_ai_country/2);
            if(this.#all_country_state.get("g")[0]=="nomatland")
            {
                this.#ai_influence_point += 3;
            }
            
            console.info("AI influence points: "+this.#ai_influence_point);
            
            //INFLUENCE POINTS DISTRIBUTION

            let ai_country_strlist =this.#all_country_of("nomatland","gflmekqrtdcjxyzsbipw34567ahnov289@u01");
            //let ai_country_strlist = this.#all_country_of("nomatland");
            let influence_point_step = [6,11,16,21];
            let priority = ["matesguay", "separatist", "nomatland"];
            let ai_country_selected = "";
            let ai_border_country_to_player = "";
            let influence_to_add = 0;
            
            
            for(let i = 0; i<influence_point_step.length;i++)
            {
                //console.log("=> influence < "+influence_point_step[i]);

                // i=0)all nomatland countries with less than 6 influence points
                // i=1)11 i=2)16 i=3)...
                ai_country_selected = this.#all_country_influence("<", influence_point_step[i], ai_country_strlist);
                
                //console.log("= => all ai countries < "+influence_point_step[i]+" : "+ai_country_selected);

                for(let k=0; k<priority.length;k++)
                {
                    //all country with less than x influence points and border country to y
                    ai_border_country_to_player = this.#all_neighboring_country_to(priority[k], ai_country_selected);

                    influence_to_add = 0;
                    for(let j = 0; j<ai_border_country_to_player.length;j++)
                    {
                        influence_to_add = 6-this.#all_country_state.get(ai_border_country_to_player[j])[1];
                        
                        //if not points enough pick up all remaining points
                        if(influence_to_add>this.#ai_influence_point)
                        {
                            influence_to_add = this.#ai_influence_point;
                        }
                        
                        //console.log(influence_to_add+" influence pts added to "+ai_border_country_to_player[j]);

                        this.#ai_influence_point -= influence_to_add;
                        this.#all_country_state.get(ai_border_country_to_player[j])[1] += influence_to_add;

                        //if no more influence point to spend => end of loop
                        if(this.#ai_influence_point==0){break;}
                    }

                    //if no more influence point to spend => end of loop
                    if(this.#ai_influence_point==0){break;}
                }

                //if no more influence point to spend => end of loop
                if(this.#ai_influence_point==0){break;}
            }
        }

        //AI ELECTIONS PHASE

        let layer_of_country = [
            "g",
            "flm",
            "ekqrt",
            "dcjxyzs",
            "bipw34567",
            "ahnov289@",
            "u01",
        ];
        //two nation to ai election
        let nation_influenced = "";
        let nation_influence = "";

        //all nation of layer choosen to influence
        let layer_enemy_nation_list = "";

        let all_potential_influencer = "";
        let all_influencer_possible = "";
        
        let i = 0;

        let ai_turn = setInterval(()=>{
            
            console.log("Election number "+(i+1));

            //layer loop
            nation_influenced = "";
            nation_influence = "";
            for(let j = 0; j<layer_of_country.length;j++)
            {
                //console.log("-> Layer nº"+j);
                layer_enemy_nation_list="";
                //nations in layer loop
                for(let k = 0; k<layer_of_country[j].length;k++)
                {
                    //console.log("- - -> Country "+layer_of_country[j][k]+" nº"+k);

                    //create list of nation is not own country
                    if(this.#all_country_state.get(layer_of_country[j][k])[0]!="nomatland")
                    {
                        layer_enemy_nation_list += layer_of_country[j][k];
                    }

                    //last loop
                    if(k==layer_of_country[j].length-1)
                    {
                        if(layer_enemy_nation_list.length!=0)
                        {
                            //console.log("- - - - -> Enemy countries in layer: "+layer_enemy_nation_list.toString());

                            while(layer_enemy_nation_list.length>0)
                            {
                                //choose a random nation in the layer to influence
                                nation_influenced = layer_enemy_nation_list[this.#random_int(0,layer_enemy_nation_list.length-1)];
                                //console.log("- - - - - - -> Enemy country choosen: "+nation_influenced);
                                
                                //remove this nation of the list (string)
                                for(let l=0; l<layer_enemy_nation_list.length;l++)
                                {
                                    if(layer_enemy_nation_list[l]==nation_influenced)
                                    {
                                        layer_enemy_nation_list = layer_enemy_nation_list.substring(0,l)+layer_enemy_nation_list.substring(l+1);
                                    }
                                }

                                //console.log("- - - - - - -> Enemy country not choosen: "+layer_enemy_nation_list);

                                //all nations who border the nation goal
                                all_potential_influencer = this.#all_country_state.get(nation_influenced)[2];

                                /*
                                * check if border nation is ai nation
                                * check if have more than 1 influence point
                                * and put it in a list
                                */
                                all_influencer_possible="";
                                for(let m=0; m<all_potential_influencer.length;m++)
                                {
                                    //check if border nation is ai nation
                                    if(this.#all_country_state.get(all_potential_influencer[m])[0]=="nomatland")
                                    {
                                        //check if nation have more than 1 influence point
                                        if(this.#all_country_state.get(all_potential_influencer[m])[1]>1)
                                        {
                                            all_influencer_possible += all_potential_influencer[m];
                                        }
                                    }
                                }

                                //if exist at least one nomatland country with influence enough
                                if(all_influencer_possible.length>0)
                                {
                                    nation_influence = all_influencer_possible.split("").reduce((a,b)=>{
                                        let inf_a = Game.#all_country_state.get(a)[1];
                                        let inf_b = Game.#all_country_state.get(b)[1];
                                        if(inf_a>inf_b){ return a; }
                                        else{ return b; }
                                    });
                                    
                                    //console.log("- - - - - - -> Country "+nation_influenced+" influenced by "+nation_influence);
                                    //nation_influence = all_influencer_possible[this.#random_int(0,all_influencer_possible.length-1)];
                                    this.#ai_election(nation_influenced, nation_influence);
                                    break;
                                }
                                //else find in another layer
                                else
                                {
                                    nation_influenced = "";
                                    nation_influence = "";
                                }
                            }
                        }
                    }

                    if(nation_influenced!="" && nation_influence!="")
                    {
                        break;
                    }
                }

                if(nation_influenced!="" && nation_influence!="")
                {
                    break;
                }

            }

            this.#graphics.redraw(this.#all_country_state, this.#selected_country);
            i++;
            if(i==5)
            {
                clearInterval(ai_turn);
                $('#ai_anim').css("display","none");
                $("#lock_back").css("display","none");
                this.#win_lose();
                alert("Te toca. Fase de organisación de tu influencia");
            }
        },1000);
    }

    static #ai_election(nation_influenced, nation_influence)
    {
        let given_influence = Math.floor(this.#all_country_state.get(nation_influence)[1]*2/3);
        if(given_influence==0){given_influence=1};
        let random = this.#random_int(0,100);
        if(random<this.#ai_level)
        {
            if(this.#all_country_state.get(nation_influenced)[1]<6)
            {
                this.#all_country_state.get(nation_influenced)[0]="nomatland";
                this.#all_country_state.get(nation_influenced)[1]=given_influence;
                this.#all_country_state.get(nation_influence)[1]-=given_influence;
            }
            else
            {
                this.#all_country_state.get(nation_influenced)[1]-=this.#influence_penalty;
            }
        }
        else
        {
            this.#all_country_state.get(nation_influence)[1]-=this.#influence_penalty;
            if(this.#all_country_state.get(nation_influence)[1]<1)
            {
                this.#all_country_state.get(nation_influence)[1]=1;
            }
        }
                
        this.#graphics.redraw(this.#all_country_state, this.#selected_country);
    }

    static #win_lose()
    {
        let is_won = true;
        let is_lost = true;
        this.#all_country_state.forEach((val,key)=>{
            if(val[0]!="matesguay")
            {
                is_won = false;
            }

            if(val[0]=="matesguay")
            {
                is_lost = false;
            }
        });
        if(is_won)
        {
            alert("¡Has reunificado todo el continente! ¡Viva el imperio Matesguay!");
            document.location.href = "../index.html";
        }
        if(is_lost)
        {
            alert("Hemos perdido nuestro ultimo territorio... ¡Pero la resistencia ya ha empezado!");
            document.location.href = "../index.html";
        }
    }

    static #close_congress()
    {
        //hide congress window
        $("#congress_content").css("display","none");
        $("#lock_back").css("display","none");
    }
    
    /**
     * check if correct answer
     * if result type remain good proposal
     * @param {int} nb1 
     * @param {int} nb2 
     * @param {int} result 
     * @returns 
     */
    static #check_answer(nb1, nb2, result)
    {
        if(this.#current_proposal.get('type')=="standard")
        {
            if(result == this.#current_proposal.get('proposal')[2])
            {
                return true;
            }
            return false;
        }
        else if(this.#current_proposal.get('type')=="unknown")
        {
            if(nb2 == this.#current_proposal.get('proposal')[1])
            {
                return true;
            }
            return false;
        }
        else if(this.#current_proposal.get('type')=="result")
        {
            for(let i = 0; i<this.#current_proposal.get('proposal').length; i++)
            {
                if(nb1 == this.#current_proposal.get('proposal')[i][0])
                {
                    if(nb2 == this.#current_proposal.get('proposal')[i][1])
                    {
                        this.#current_proposal.get('proposal').splice(i,1);
                        return true;
                    }
                }
            }
            return false;
        }
    }

    //put in Game memory param of next current proposal
    static #next_proposal(new_proposal='default')
    {
        if(this.#current_proposal.get('count')==0 || new_proposal=='new')
        {
            let proposal = this.#operation.get();
            if(proposal.get("type")=='result')
            {
                proposal.set("count",proposal.get("proposal").length);
            }
            else
            {
                proposal.set("count",1);
            }
            this.#current_proposal = proposal;
        }
    }
    
    
    static isSizeLessThan1000px()
    {
        return this.#isWidthLessThan1000px;
    }

    //GETTERs
    static get_country_state()
    {
        return this.#all_country_state;
    }
    static show()
    {
        return this.#graphics;
    }
    static get_saved_url()
    {
        return this.#saved_url;
    }
    /*
    static get_selected_country()
    {
        return this.#selected_country;
    }
    static get_map()
    {
        return this.#map;
    }
    
    static get_country_name()
    {
        return this.#all_country_name;
    }
    static get_proposal()
    {
        return this.#current_proposal;
    }
    static op()
    {
        return this.#operation;
    }
    static show()
    {
        return this.#graphics;
    }
    static get_ai_level()
    {
        return this.#ai_level;
    }
    static get_param()
    {
         return this.#op_param;
    }
    */
}