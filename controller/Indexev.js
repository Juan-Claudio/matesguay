class Indexev
{
    //0:disable, 1:inactive, 2:active
    static tabs = new Map([
        ['1sum',0],
        ['2sub',0],
        ['3mul',0],
        ['4div',0]
    ]);


    //fusionar los dos siguientes
    static id_op_to_sign = new Map([
        ['1sum','+'],
        ['2sub','-'],
        ['3mul','×'],
        ['4div',':'],
        ['no_tab','no_tab']
    ]);

    static id_interval_to_index = {
        'nb1_min':0,
        'nb1_max':1,
        'nb2_min':2,
        'nb2_max':3
    };

    static curr_sign = '';
    
    //operation type name to index in game_param.get(sign)
    static op_type = new Map([
        ['standard',5],
        ['unknown',6],
        ['result',7],
    ]);

    //constant intervals+carry associate to difficulty
    static diff_to_interval = new Map([
        ['+0',[0,9,1,9,0]],
        ['+1',[0,99,1,99,0]],
        ['+2',[0,99,1,99,1]],
        ['+3',[3,999,3,999,1]],
        ['+4',[3,9999,3,9999,1]],
        ['-0',[1,9,0,9,0]],
        ['-1',[1,99,0,99,0]],
        ['-2',[1,99,0,99,1]],
        ['-3',[3,999,3,999,1]],
        ['-4',[3,9999,3,9999,1]],
        ['×0',[0,2,0,10,0]],
        ['×1',[0,5,1,10,0]],
        ['×2',[2,6,2,10,0]],
        ['×3',[6,9,3,9,0]],
        ['×4',[2,12,3,12,0]],
        [':0',[0,2,0,10,0]],
        [':1',[0,5,1,10,0]],
        [':2',[2,6,2,10,0]],
        [':3',[6,9,3,9,0]],
        [':4',[2,12,3,12,0]],
    ]);

    static ai_level_to_percent = {
        20:'0',
        35:'1',
        51:'2',
        67:'3',
        83:'4',
        99:'5'
    };

    //0:muy fácil, 1:fácil, 2:intermedio,
    //3:dificil, 4:experto, 5:personal
    /* game_param Map< string sign , int[9] paramters >
    * +-------+-------+-------+-------+-------+----------+---------+--------+----------+
    * |nb1_min|nb1_max|nb2_min|nb2_max|isCarry|isStandard|isUnknown|isResult|difficulty|
    * +-------+-------+-------+-------+-------+----------+---------+--------+----------+
    * |   0   |   1   |   2   |   3   |   4   |     5    |    6    |    7   |     8    |
    * +-------+-------+-------+-------+-------+----------+---------+--------+----------+
    */
    static game_param = new Map([
        ['+',[0,99,1,99,0,1,0,0,1]],
        ['-',[0,99,1,99,0,1,0,0,1]],
        ['×',[0,5,1,10,0,1,0,0,1]],
        [':',[0,5,1,10,0,1,0,0,1]],
        ['ai',20],
    ]);

    constructor()
    {
        if(this.constructor=Indexev)
        {
            throw new Error("Indexev is not instantiable class.");
        }
    }

    static init()
    {
        $("#change_ai_level").val(0);
        Indexev.click_tab();
        Indexev.change_ai_level();
        Indexev.click_play();
        Indexev.click_load();
    }

    //put settings.html in .param_contener of index.html
    //set events and refresh graphics
    static settings(operation_sign)
    {
        $.post("view/settings.html",{},(data,status)=>{
            if(status=='success')
            {
                $(".param_contener").html(data);
                $(".op_sign").text(operation_sign);
                if(operation_sign=='+' || operation_sign=='-')
                {
                    $("#carry_option").attr("class","");
                }
                else
                {
                    $("#carry_option").attr("class","hidden");
                }
                Indexev.click_optype();
                Indexev.change_difficulty();
                Indexev.click_carry();
                Indexev.change_intervals();

                Indexev.refresh_optype(Indexev.curr_sign);
                Indexev.refresh_difficulty(Indexev.curr_sign);
                Indexev.refresh_carry(Indexev.curr_sign);
                Indexev.refresh_intervals(Indexev.curr_sign);
                Indexev.refresh_check_intervals(Indexev.curr_sign);
            }
            else
            {
                $(".param_contener").html("<span style=\"font-size:x-large;color:#500;font-weight:bold;\">ERROR</span>");
            }
        },'html');
    }

    static selected_op()
    {
        let selected_tab = 'no_tab';
        this.tabs.forEach((val,key)=>{
            if(val==2){ selected_tab=key;return; }
        });
        return selected_tab;
    }

    static check_intervals_bigger_than_6(sign)
    {
        let interval_too_small = false;
        for(let i=0; i<4; i++)
        {
            if(Indexev.game_param.get(sign)[i]=="NaN"
            || Indexev.game_param.get(sign)[i]=="negativ")
            {
                return false;
            }
        }
        interval_too_small = (Indexev.game_param.get(sign)[1]-Indexev.game_param.get(sign)[0])<7;
        interval_too_small |= (Indexev.game_param.get(sign)[3]-Indexev.game_param.get(sign)[2])<7;
        if(interval_too_small){ return false; }
        return true;
    }

    static check_intervals_bigger_eq_0(sign)
    {
        let interval_too_small = false;
        for(let i=0; i<4; i++)
        {
            if(Indexev.game_param.get(sign)[i]=="NaN"
            || Indexev.game_param.get(sign)[i]=="negativ")
            {
                return false;
            }
        }
        interval_too_small = (Indexev.game_param.get(sign)[1]-Indexev.game_param.get(sign)[0])<0;
        interval_too_small |= (Indexev.game_param.get(sign)[3]-Indexev.game_param.get(sign)[2])<0;
        if(interval_too_small){ return false; }
        return true;
    }

    static can_start_game()
    {
        let game = [];
        let choosen_operations = [];
        let is_operation_type = false;

        Indexev.tabs.forEach((val,key)=>{
            if(val!=0){ choosen_operations.push(Indexev.id_op_to_sign.get(key)); }
        });

        //1) check if at least 1 operation is choosen
        if(choosen_operations.length==0){ return 'operation'; }
        
        for(let i = 0;i<choosen_operations.length;i++)
        {
            game = Indexev.game_param.get(choosen_operations[i]);
            is_operation_type = false;

            //2) check if at least one operation type selected
            if(choosen_operations[i]!='×')
            {
                if(game[5]==1 || game[6]==1){ is_operation_type=true; }
                game[7]==0; //if modified by hacking
            }
            else
            {
                if(game[5]==1 || game[6]==1 || game[7]==1){ is_operation_type=true; }
            }
            if(!is_operation_type){ return 'op_type'+choosen_operations[i]; }
            
            //3) check intervals -> min<max, min-max>=[0-7], no exist incorrect number
            if(choosen_operations[i]=='+' || choosen_operations[i]=='-')
            {
                if(!Indexev.check_intervals_bigger_than_6(choosen_operations[i])){ return 'interval'+choosen_operations[i]; }
            }
            else
            {
                if(!Indexev.check_intervals_bigger_eq_0(choosen_operations[i])){ return 'interval'+choosen_operations[i]; }
                //if(choosen_operations[i]==':' && game[2]<=0){ return 'division0'; }
            }
        }
        return true;
    }

    /**********************
    ** REFRESH VARIABLES **
    ***********************/

    //control tab state variable
    static click_tab()
    {
        let tab_state = 0;
        let id = '';

        $(".tab").click(function(){
            id=$(this).attr('id');
            tab_state = Indexev.tabs.get(id);
            switch(tab_state)
            {
                case 0:
                case 1:
                    Indexev.tabs.forEach((val,key)=>
                    {
                        if(key==id)
                        {
                            Indexev.tabs.set(key,2);
                        }
                        else if(val==2)
                        {
                            Indexev.tabs.set(key,1);
                        }
                    });
                    break;
                case 2:
                    Indexev.tabs.set(id,0);
                    break;
                default:
                    console.error('Indexev.tab:tab_id param error');
                    break;
            }

            Indexev.curr_sign = Indexev.id_op_to_sign.get(Indexev.selected_op());
            Indexev.refresh_tabs();
            //if tab selected, refresh informations of this operation
            if(Indexev.curr_sign!="no_tab")
            {
                Indexev.settings(Indexev.curr_sign);
            }
            else
            {
                Indexev.hide_params();
            }
        });
    }

    static click_optype()
    {
        $(".diff").click(function(){
            let id=$(this).attr('id');
            let sign = Indexev.curr_sign;
            let index = Indexev.op_type.get(id);

            if(sign!="×")
            {
                if(id=="result"){ alert('Este tipo está disponible solo para el producto.');return; }
            }

            if(Indexev.game_param.get(sign)[index]==0)
            {
                Indexev.game_param.get(sign)[index]=1;
            }
            else
            {
                Indexev.game_param.get(sign)[index]=0;
            }
            Indexev.refresh_optype(sign);
        });
    }

    static change_difficulty()
    {
        $("#change_diff").on('change',function(){
            let value = $(this).val();
            let sign = Indexev.curr_sign;
            Indexev.game_param.get(sign)[8]=parseInt(value);
            if(value!='5')
            {
                for(let i = 0; i<5; i++)
                {
                    Indexev.game_param.get(sign)[i]=Indexev.diff_to_interval.get(sign+""+value)[i];
                }
                $("#intervals").attr('class','interval_group hidden');
            }
            else
            {
                $("#intervals").attr('class','interval_group');
            }
            Indexev.refresh_difficulty(sign);
            Indexev.refresh_intervals(sign);
            Indexev.refresh_carry(sign);
        });
    }

    static click_carry()
    {
        $("#carry").click(function(){
            let sign = Indexev.curr_sign;
            let isCarry = Indexev.game_param.get(sign)[4];
            isCarry = (isCarry==0) ? false : true;
            if(isCarry){ Indexev.game_param.get(sign)[4]=0; }
            else{ Indexev.game_param.get(sign)[4]=1; }
            Indexev.refresh_carry(sign);
        });
    }

    static change_intervals()
    {
        $(".nb").on('keyup',function(){
            let id = $(this).attr('id');
            let input = $(this).val();
            let sign = Indexev.curr_sign;
            let index = Indexev.id_interval_to_index[id];

            if(input[0]=='-' && !/[^0-9]/.test(input.substring(1,input.length-1)))
            {
                Indexev.game_param.get(sign)[index]="negativ";
            }
            else if(/[^0-9]/.test(input))
            {
                Indexev.game_param.get(sign)[index]="NaN";
            }
            else
            {
                Indexev.game_param.get(sign)[index]=parseInt(input);
            }

            Indexev.refresh_check_intervals(sign);
        });
    }

    static change_ai_level()
    {
        $("#change_ai_level").on('change',function(){
            let value = $(this).val();
            let value_to_level = Object.entries(Indexev.ai_level_to_percent);
            let ai_level = value_to_level[parseInt(value)][0];
            Indexev.game_param.set('ai',ai_level);
            Indexev.refresh_ai_level();
        });
    }

    static click_play()
    {
        $("#play").click(function(){
            let can_play = Indexev.can_start_game();
            let warn = '';
            let choosen_operations = [];
            let url = '?A5z=';
            let alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let rand_char = '';
            let game = [];

            switch(can_play)
            {
                case 'operation':warn='No has elegido ninguna operación.';break;
                case 'op_type+':warn='No has elegido ningún tipo de suma.';break;
                case 'op_type-':warn='No has elegido ningún tipo de resta.';break;
                case 'op_type×':warn='No has elegido ningún tipo de producto.';break;
                case 'op_type:':warn='No has elegido ningún tipo de división.';break;
                case 'interval+':warn='Intervalos de la suma incorrectos.';break;
                case 'interval-':warn='Intervalos de la resta incorrectos.';break;
                case 'interval×':warn='Intervalos del producto incorrectos.';break;
                case 'interval:':warn='Intervalos de la división incorrectos.';break;
                case 'division0':warn='Potencial división por 0.\nVerifica los intervalos de la división.';break;
                default:break;
            }

            if(warn!=''){ alert(warn);return; }

            function randint(min=0, max=100)
            {
                return Math.floor(Math.random() * (max-min+1))+min;
            }
            
            Indexev.tabs.forEach((val,key)=>{
                if(val!=0){ choosen_operations.push(Indexev.id_op_to_sign.get(key)); }
            });

            for(let sign of choosen_operations)
            {
                game=Indexev.game_param.get(sign);
                url+=sign+'_';

                for(let i=0; i<8; i++)
                {
                    rand_char = alpha[randint(0,alpha.length-1)];
                    if(i!=7){ url+=game[i]+rand_char; }
                    else{ url+= game[i]+']'; }
                }
            }

            url = url.substring(0,url.length-1); //remove useless last ']'

            url+='&I1a='+Indexev.game_param.get('ai');

            document.location.href = "view/matesguayImperio.html"+url;
        });
    }

    static click_load()
    {
        $("#load").click(function(){
            let all_cookies = document.cookie.split("; ");
            let is_loaded_game = false;
            for(let cook of all_cookies)
            {
                if(/saved_game=/.test(cook))
                {
                    is_loaded_game=true;
                    break;
                }
            }

            if(!is_loaded_game){ alert("No tienes una partida guardada");return; }
            else
            {
                document.location.href = 'view/matesguayImperio.html?load=1';
            }
        });
    }

    /*********************
    ** REFRESH GRAPHICS **
    *********************/

    //refresh tab graphics
    static refresh_tabs()
    {
        Indexev.tabs.forEach((val,key)=>{
            switch(val)
            {
                case 0: $('#'+key).attr("class","tab disabled");break;
                case 1: $('#'+key).attr("class","tab checked");break;
                case 2: $('#'+key).attr("class","tab active checked");break;
                default:console.error("ERROR REFRESH TABS");
            }
        });
    }

    static refresh_optype(sign)
    {       
        Indexev.op_type.forEach((val,key)=>{
            if(Indexev.game_param.get(sign)[val]==0)
            {
                $("#"+key).attr('class','diff param btn disabled');
            }
            else
            {
                $("#"+key).attr('class','diff param btn checked');
            }
        });
    }

    static refresh_difficulty(sign)
    {
        //check
        if(sign!='-' && sign!="+" && sign!='×' && sign!=':')
        {
            console.error('Indexev.refresh_difficulty: sign "'+sign+'" not allowed. Signs allowed [+-×:].');
            return;
        }

        //variables
        let difficulty = Indexev.game_param.get(sign)[8];
        let text = '';

        //actions
        switch(difficulty)
        {
            case 0: text='MUY FÁCIL'; break;
            case 1: text='FÁCIL'; break;
            case 2: text='INTERMEDIO'; break;
            case 3: text='DIFÍCIL'; break;
            case 4: text='EXPERTO'; break;
            case 5: text='PERSONAL'; break;
            default:console.error('Indexev.refresh_difficulty:difficulty variable ERROR.');break;
        }

        $("#difficulty_text").text(text);
        $("#change_diff").val(difficulty);

        if(difficulty==5){ $("#intervals").attr('class','interval_group'); }
    }

    static refresh_carry(sign)
    {
        let isCarry = Indexev.game_param.get(sign)[4];
        isCarry = (isCarry==0) ? false : true;
        if(isCarry)
        {
            $("#carry").attr('class','param btn checked');
        }
        else
        {
            $("#carry").attr('class','param btn disabled');
        }
    }

    static refresh_check_intervals(sign)
    {
        let warn='';
        let is_warn = false;
        let game_param = Indexev.game_param.get(sign);
        let index_to_id = ['nb1_min', 'nb1_max', 'nb2_min','nb2_max'];

        for(let i = 0; i<4; i++)
        {
            is_warn=false;
            if(game_param[i]=="negativ")
            {
                warn='Solo números positivos.';
                is_warn=true;
            }
            else if(game_param[i]=="NaN")
            {
                warn='Solo cifras.';
                is_warn=true;
            }
            else if(game_param[i]>9999)
            {
                warn='Máx 9999.';
                is_warn=true;
            }

            if(is_warn){ $("#"+index_to_id[i]).css('background-color','rgba(255,255,0,0.3)'); }
            else
            {
                $("#"+index_to_id[i]).css('background-color','rgba(0,0,0,0.3)');
            }
        }

        //for multiplication and division interval min is different
        if(sign=='×' || sign==':')
        {
            //if interval too small and not other issue
            //change warn mess
            if(!Indexev.check_intervals_bigger_eq_0(sign))
            {
                warn=(warn!='') ? warn : '/!\\ min > max /!\\';
            }
        }
        else
        {
            //if interval too small and not other issue
            //change warn mess
            if(!Indexev.check_intervals_bigger_than_6(sign))
            {
                warn=(warn!='') ? warn : '/!\\ max-min < 7 /!\\';
            }
        }

        //display warn mess
        $("#info_mess").text(warn);
    }

    static refresh_intervals(sign)
    {
        let game_param = Indexev.game_param.get(sign);
        let index_to_id = ['nb1_min', 'nb1_max', 'nb2_min','nb2_max'];
        for(let i = 0; i<4; i++)
        {
            $("#"+index_to_id[i]).val(game_param[i]);
        }
    }

    static refresh_ai_level()
    {
        let ai_level = Indexev.game_param.get('ai');
        let text = '';
        switch(ai_level)
        {
            case '20':text='MUY MALO';break;
            case '35':text='MALO';break;
            case '51':text='MEDIO';break;
            case '67':text='BUENO';break;
            case '83':text='MUY BUENO';break;
            case '99':text='NO FALLA';break;
            default:console.error('Indexev.refresh_ai_level: ai_level ERROR.');break;
        }
        $("#ai_level").text(text);
    }

    static hide_params()
    {
        $(".param_contener").html('');
    }
}