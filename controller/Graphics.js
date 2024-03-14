class Graphics
{
    static #instanciated = false;
   
    //game principal canvas
    #ctx = {};

    #matesguay_country_img = [];
    #nomatland_country_img = [];

    #matesguay_country_img_map = new Map();
    #nomatland_country_img_map = new Map();

    #castle_name_img = new Image();
    #image_charged = [];

    //game congress vote canvas
    #congress_img = new Image();
    #matesguay_victory_img = new Image();
    #nomatland_victory_img = new Image();
    #separatist_victory_img = new Image();
    #ready = [];

    #last_counter = 1;
    #different_op_counter = 0;

    constructor(game_canvas_id, all_country_name, all_country_state)
    {
        if(Graphics.#instanciated)
        {
            if(this.constructor==Graphics)
            {
                throw new Error("Graphics is not instanciable twice.");
            }
        }
        else
        {           
            this.#ctx = document.getElementById(game_canvas_id).getContext("2d");
            //charge all images
            this.#load_game_img(all_country_name);
            //draw map
            this.#draw_game(all_country_name, all_country_state);
            Graphics.#instanciated = true;
        }
    }

    #convert_country_img_array_to_map(all_country_name) //NEW
    {
        for(let i = 0; i<all_country_name.length; i++)
        {
            this.#matesguay_country_img_map.set(all_country_name[i], this.#matesguay_country_img[i]);
            this.#nomatland_country_img_map.set(all_country_name[i], this.#nomatland_country_img[i]);
        }
    }

    #load_game_img(all_country_name)
    {                
        //load map images
        //set src attribut of each image
        for(let i = 0; i<37; i++)
        {
            this.#matesguay_country_img.push(new Image());
            this.#nomatland_country_img.push(new Image());
            this.#matesguay_country_img[i].src = "../public/img/countries/matesguay/"+all_country_name[i]+".png";
            this.#nomatland_country_img[i].src = "../public/img/countries/nomatland/"+all_country_name[i]+".png";
            this.#matesguay_country_img[i].onload = ()=>{this.#image_charged[i]=true};
            this.#nomatland_country_img[i].onload = ()=>{this.#image_charged[i+37]=true};
        }

        this.#castle_name_img.src = "../public/img/castles_names.png";
        this.#castle_name_img.onload = ()=>{this.#image_charged[74] = true};

        //load congress vote images
        this.#congress_img.src = "../public/img/elecciones/congress_conquest.png";
        this.#matesguay_victory_img.src = "../public/img/elecciones/matesguay_victory.png";
        this.#nomatland_victory_img.src = "../public/img/elecciones/nomatland_victory.png";
        this.#separatist_victory_img.src = "../public/img/elecciones/separatist_victory.png";

        let THIS = this;

        this.#congress_img.onload = function(){THIS.#ready.push(true);};
        this.#matesguay_victory_img.onload = function(){THIS.#ready.push(true);};
        this.#nomatland_victory_img.onload = function(){THIS.#ready.push(true);};
        this.#separatist_victory_img.onload = function(){THIS.#ready.push(true);};
    }

    #draw_game(all_country_name, all_country_state)
    {
        //draw when ready castles and names of empires
        if(this.#image_charged.length==75)
        {
            this.#convert_country_img_array_to_map(all_country_name); //NEW
            
            this.#draw_country("u", 'matesguay');
            this.#draw_country("g", 'nomatland');
            this.#ctx.drawImage(this.#castle_name_img, 0, 0);
            this.#draw_influence_point(all_country_state);
        }
        else
        {
            let k = 0;
            let THIS = this;

            let tries = setInterval(()=>{

                if(this.#image_charged.length==75)
                {
                    this.#convert_country_img_array_to_map(all_country_name); //NEW

                    this.#draw_country("u", 'matesguay');
                    this.#draw_country("g", 'nomatland');
                    this.#ctx.drawImage(THIS.#castle_name_img, 0, 0);
                    this.#draw_influence_point(all_country_state);
                    clearInterval(tries);

                    console.info("Graphics done in "+k*20+" millisecond(s)");
                    Game.show().redraw(Game.get_country_state(),'');
                }
                else
                {
                    k++;

                    for(let i = 0; i<THIS.#matesguay_country_img.length; i++)
                    {
                        if(THIS.#matesguay_country_img[i].width != 0){THIS.#image_charged[i]=true};
                        if(THIS.#nomatland_country_img[i].width != 0){THIS.#image_charged[i+37]=true};
                    }
                    if(THIS.#castle_name_img.width != 0){THIS.#image_charged[74] = true};

                    if(k==500)
                    {
                        console.error("Some trouble with image to charge");
                        console.log(THIS.#image_charged);
                        clearInterval(tries);
                    }
                }
            },20);
        }
    }
    
    #draw_operation(id, current_proposal, all_intervals)
    {
        let op_type = current_proposal.get("type");
        let op_sign = current_proposal.get("sign");
        let content='';
        let intervals = '';
        let result_counter = current_proposal.get("count");
        if(this.#last_counter<=result_counter)
        {
            this.#different_op_counter++;
        }
        let counter_form = (this.#different_op_counter%2==0) ? "◼" : "▲";
        let form_displayed = "";
        let nb1 = 0;
        let nb2 = 0;
        let op = "";
        let result = 0;
        let id_box = '';
        let interval1 = [];
        let interval2 = [];

        this.#last_counter = result_counter;

        switch(op_type)
        {
            case "standard":
                nb1 = current_proposal.get('proposal')[0];
                op = current_proposal.get('sign');
                nb2 = current_proposal.get('proposal')[1];
                result = "?";
                id_box = "result";
                break;
            case "unknown":
                nb1 = current_proposal.get('proposal')[0];
                op = current_proposal.get('sign');
                nb2 = "?";
                result = current_proposal.get('proposal')[2];
                id_box = "nb2";
                break;
            case "result":
                nb1 = '?';
                op = current_proposal.get('sign');
                nb2 = '?';
                result = current_proposal.get('proposal')[0][2];
                id_box = "nb1";
                break;
        }

        content = `<div id="nb1">${nb1}</div><div id="op">${op}</div><div id="nb2">${nb2}</div><div>=</div><div id="result">${result}</div>`;
        $("#"+id).html(content);
        
        if(op_sign=="×")
        {
            for(let i=0; i<result_counter; i++)
            {
                form_displayed+=counter_form;
            }
            interval1.push(all_intervals.get(op_sign)[0]);
            interval1.push(all_intervals.get(op_sign)[1]);
            interval2.push(all_intervals.get(op_sign)[2]);
            interval2.push(all_intervals.get(op_sign)[3]);
            
            intervals = `<div id="interval1" title="números entre ${interval1[0]} y ${interval1[1]} incluidos">[${interval1[0]},${interval1[1]}]</div>`;
            intervals += `<div id="interval2" title="números entre ${interval2[0]} y ${interval2[1]} incluidos">[${interval2[0]},${interval2[1]}]</div>`;
            intervals += `<div id="result_counter">${form_displayed}</div>`;

            $("#"+id).append(intervals);
        }
                
        $("#"+id_box).css({
            "color":"#ff0000",
            'border-color':'#ff0000',
        });
    }
    
    /**
     * Paint country of master in his color
     * @param {string} country_name 
     * @param {string} master_of_country 
     */
    #draw_country(country_name, master_of_country='matesguay')
    {
        let all_conquered_country;
        if(master_of_country=='matesguay')
        {
            all_conquered_country = this.#matesguay_country_img_map;
            this.#ctx.drawImage(all_conquered_country.get(country_name), 0, 0);
        }
        else if(master_of_country=='nomatland')
        {
            all_conquered_country = this.#nomatland_country_img_map;
            this.#ctx.drawImage(all_conquered_country.get(country_name), 0, 0);
        }
    }

    #draw_selected_country(country_name="@")
    {
        let halo = new Image();
        halo.src = `../public/img/countries/selection/${country_name}.png`;
        halo.onload = ()=>{ this.#ctx.drawImage(halo, 0, 0); };
    }
    
    #erase()
    {
        this.#ctx.clearRect(0,0,1229,819);
    }
    
    //public methods

    redraw(all_country_state, selected_country)
    {
        this.#erase();
        
        all_country_state.forEach((val, key)=>{
            this.#draw_country(key, val[0]);
        });

        this.#ctx.drawImage(this.#castle_name_img, 0, 0);

        if(selected_country!="")
        {
            this.#draw_selected_country(selected_country);
        }

        this.#draw_influence_point(all_country_state);
    }

    //draw influence points on countries
    #draw_influence_point(all_country_state)
    {
        all_country_state.forEach((val,key)=>{
            let x = parseInt(val[3].split(",")[0]);
            let y = parseInt(val[3].split(",")[1]);
            this.#ctx.fillStyle = "#163500";
            this.#ctx.font = "40px Comic Sans Ms";
            this.#ctx.textAlign = "center";
            this.#ctx.textBaseline = "middle";
            this.#ctx.fillText(val[1],x,y);
            this.#ctx.strokeStyle = "#d4c697";
            this.#ctx.strokeText(val[1],x,y);
        });
    }

    draw_congress_vote(id_operation_div, current_proposal, all_intervals, correct_answer_count=0, player="matesguay", opponent="nomatland", nb_player_deputies=0, nb_opponent_deputies=0)
    {
        //control number of deputies
        if(nb_player_deputies>24 || nb_opponent_deputies>24)
        {
            console.error("Impossible to have more than 24 deputies who are agree with us (or agree with our opponent).");
            return;
        }

        //reponsive design
        let ajustment = (Game.isSizeLessThan1000px()) ? 2 : 1;

        //drawing paramaters
        let congress_ctx = document.getElementById('congress').getContext('2d');
        let img = {};
        
        //distribution of deputies number
        let nb_deputies_of_line = [0,0,0,0,0,0];
        let nb_opponent_of_line = [0,0,0,0,0,0];
        let max_of_line = [4,6,5,4,3,2];

        //parameters to color all deputies
        let x_opponent = Math.floor(835/ajustment);
        let x = Math.floor(75/ajustment);
        let y = [226/ajustment,266/ajustment,316/ajustment,366/ajustment,426/ajustment,496/ajustment]; //top to bottom
        let width = [
            [0,52,175,255,375],
            [0,90,145,202,262,322,382],
            [0,145,202,262,322,382],
            [0,203,263,323,382],
            [0,256,316,376],
            [0,330,410],
        ]; //left to right

        //ajustment
        for(let i = 0; i<width.length;i++)
        {
            for(let j = 0; j<width[i].length;j++)
            {
                width[i][j] /= ajustment;
            }
        }

        let height = (ajustment==1) ? 40 : 26;
        
        //display congress window
        $("#congress_content").css("display","block");
        $("#lock_back").css("display","block");

        //percents written
        let player_percent = Math.floor((nb_player_deputies/47)*100);
        let opponent_percent = Math.floor((nb_opponent_deputies/47)*100);
        let opponent_color = (opponent=="nomatland") ? '#bb0029' : '#b529b9';
        $("#opponent_result").css("color",opponent_color);
        $("#player_result").text(player_percent+"%");
        $("#opponent_result").text(opponent_percent+"%");        

        //display of victory of player, nomatland
        //or separatists or congress progress
        if(nb_player_deputies==24)
        {
            if(player=="matesguay")
            {
                img = this.#matesguay_victory_img;
            }
        }
        else if(nb_opponent_deputies==24)
        {
            if(opponent=="nomatland")
            {
                img = this.#nomatland_victory_img;
            }
            else
            {
                img = this.#separatist_victory_img;
            }
        }
        else
        {
            img = this.#congress_img;
        }

        //distribution of player deputies number
        for(let i=0;i<nb_player_deputies;i++)
        {
            for(let j = 0; j<max_of_line.length; j++)
            {
                if(nb_deputies_of_line[j]<max_of_line[j])
                {
                    nb_deputies_of_line[j]++;
                    break;
                }
            }
        }

        //distribution of opponent deputies number
        for(let i=0;i<nb_opponent_deputies;i++)
        {
            for(let j = 0; j<max_of_line.length; j++)
            {
                if(nb_opponent_of_line[j]<max_of_line[j])
                {
                    nb_opponent_of_line[j]++;
                    break;
                }
            }
        }

        //erase all
        congress_ctx.clearRect(0,0,910,732);
        
        //gauge background
        congress_ctx.fillStyle = "#303010";
        congress_ctx.fillRect(5,12/ajustment,900/ajustment,45);

        //gauge foreground
        congress_ctx.fillStyle = "#ffff00";
        congress_ctx.fillRect(5,12/ajustment,(correct_answer_count*45)/ajustment,45);
        
        //background-color white to color neutral deputies
        congress_ctx.fillStyle = "#ffffff";
        congress_ctx.fillRect(75/ajustment,226/ajustment,750/ajustment,320/ajustment);

        //color player deputies
        congress_ctx.fillStyle = "#2c2cff";
        congress_ctx.fillRect(x,y[0],width[0][nb_deputies_of_line[0]],height);
        congress_ctx.fillRect(x,y[1],width[1][nb_deputies_of_line[1]],height);
        congress_ctx.fillRect(x,y[2],width[2][nb_deputies_of_line[2]],height);
        congress_ctx.fillRect(x,y[3],width[3][nb_deputies_of_line[3]],height);
        congress_ctx.fillRect(x,y[4],width[4][nb_deputies_of_line[4]],height);
        congress_ctx.fillRect(x,y[5],width[5][nb_deputies_of_line[5]],height);

        //change width param to color opponent deputies
        width = [
            [0,57,185,255,375],
            [0,90,145,204,262,322,382],
            [0,145,204,262,322,382],
            [0,203,263,323,380],
            [0,273,326,382],
            [0,340,420],
        ];

        //ajustment
        for(let i = 0; i<width.length;i++)
        {
            for(let j = 0; j<width[i].length;j++)
            {
                width[i][j] /= ajustment;
            }
        }
        
        //select color for separatists or nomatland deputies
        if(opponent=="separatist")
        {
            congress_ctx.fillStyle = "#b529b9";
        }
        else
        {
            congress_ctx.fillStyle = "#bb0029";
        }
        
        //color separatists or nomatland deputies
        congress_ctx.fillRect(x_opponent,y[0],-1*width[0][nb_opponent_of_line[0]],height);
        congress_ctx.fillRect(x_opponent,y[1],-1*width[1][nb_opponent_of_line[1]],height);
        congress_ctx.fillRect(x_opponent,y[2],-1*width[2][nb_opponent_of_line[2]],height);
        congress_ctx.fillRect(x_opponent,y[3],-1*width[3][nb_opponent_of_line[3]],height);
        congress_ctx.fillRect(x_opponent,y[4],-1*width[4][nb_opponent_of_line[4]],height);
        congress_ctx.fillRect(x_opponent,y[5],-1*width[5][nb_opponent_of_line[5]],height);
        if(ajustment==1)
        {
            congress_ctx.drawImage(img,0,0);
        }
        else
        {
            congress_ctx.drawImage(img,0,0,455,376);
        }

        //write operation request
        this.#draw_operation(id_operation_div, current_proposal, all_intervals);
    }
}