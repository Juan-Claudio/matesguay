class Operation
{
    static #instanciated = false;

    /* #all_operation_paramater Map< string sign , int[8] paramters >:
    * +-------+-------+-------+-------+-------+----------+---------+--------+
    * |nb1_min|nb1_max|nb2_min|nb2_max|isCarry|isStandard|isUnknown|isResult|
    * +-------+-------+-------+-------+-------+----------+---------+--------+
    * |   0   |   1   |   2   |   3   |   4   |     5    |    6    |    7   |
    * +-------+-------+-------+-------+-------+----------+---------+--------+
    */
    #all_operation_paramater;
    #all_operation_sign = [];

    /**
     * 
     * @param {Map<string,array>} operation_paramater <sign, array(8) of parameters>
     */
    constructor(operation_paramater)
    {
        if(Operation.#instanciated)
        {
            if(this.constructor==Operation)
            {
                throw new Error("Operation is not instanciable twice.");
            }
        }
        else
        {
            this.#all_operation_paramater = operation_paramater;
            this.#all_operation_paramater.forEach((val,key)=>{
                this.#all_operation_sign.push(key);
            });
            Operation.#instanciated = true;
        }
    }

    //control wich operation is created
    get()
    {
        return this.#random_operation();
    }

    load(operation_paramater)
    {
        console.warn("Yessss");
        this.#all_operation_sign=[];
        this.#all_operation_paramater = operation_paramater;
        this.#all_operation_paramater.forEach((val,key)=>{
            this.#all_operation_sign.push(key);
        });
    }
    
    /******************************************************/
    /****** Data extractor (all_operation_paramater) ******/
    /******************************************************/
    
    get_operation_intervals(operation_sign)
    {
        let intervals = [];
        for(let i = 0; i<4; i++)
        {
            intervals.push(this.#all_operation_paramater.get(operation_sign)[i]);
        }
        return intervals;
    }
    #isCarryAllowed(operation_sign)
    {
        return this.#all_operation_paramater.get(operation_sign)[4]==1 ? true : false;
    }
    #get_operation_type_of(operation_sign)
    {
        let op_param = this.#all_operation_paramater.get(operation_sign);
        let op_type = [];
        if(op_param[5]==1){op_type.push("standard");}
        if(op_param[6]==1){op_type.push("unknown");}
        if(op_param[7]==1){op_type.push("result");}

        return op_type;
    }

    /*******************/
    /****** TOOLS ******/
    /*******************/

    /**
     * Convert int in array with one digit in each cell
     * ej. in:(56,4) out:[0,0,5,6]
     * ej. in:(47) out:[4,7]
     * @param {int} num
     * @param {int} nb_digit =-1 number of cell, cell empty at left fill with 0
     * @returns array ej. [0,0,5,6]
     */
    #num_in_arr(num, nb_digit=-1)
    {
        let num_str = num+"";
        let num_arr = [];

        for(let i = 0; i<num_str.length; i++)
        {
            num_arr.push(parseInt(num_str[i]));
        }

        if(typeof(nb_digit)!="number")
        {
            console.error("second parameter: only integer");
            return;
        }
        else
        {
            let num_zero_to_add = nb_digit-num_str.length;
            num_zero_to_add = (num_zero_to_add<0) ? 0 : num_zero_to_add;

            for(let i = 0; i<num_zero_to_add; i++)
            {
                num_arr.unshift(0);
            }
        }
        
        return num_arr;
    }

    //lower and higher include
    #random_int(lower=0,higher=10)
    {
        if(lower==0)
        {
            return Math.floor(Math.random()*(higher+1));
        }
        return Math.floor(Math.random()*(higher-(lower-1)))+lower;
    }

    //return random value in array
    #random_operation_sign_or_type(array_of_element)
    {
        let random_index = this.#random_int(0,array_of_element.length-1);
        return array_of_element[random_index];
    }

    /*********************/
    /****** METHODS ******/
    /*********************/

    /**
     * return random operation and name of his type ej. [nb1:int, nb2:int, result:int, type:string, sign:string]
     * @returns Map<string, []|string>
     */
    #random_operation()
    {
        let operation_sign = this.#random_operation_sign_or_type(this.#all_operation_sign);
        let operation_intervals = this.get_operation_intervals(operation_sign);
        let carry = this.#isCarryAllowed(operation_sign);
        let operation_type = this.#random_operation_sign_or_type(this.#get_operation_type_of(operation_sign));
        let rand_nb1 = this.#random_int(operation_intervals[0],operation_intervals[1]);
        let rand_nb2 = this.#random_int(operation_intervals[2],operation_intervals[3]);
        let operation = [];
        let possible_multiplication = [];
        let proposals_parameters = new Map();
        
        switch(operation_sign)
        {
            case "+":
                
                if(carry)
                {
                    operation = [rand_nb1, rand_nb2, rand_nb1+rand_nb2];
                }
                else
                {
                    operation = this.#rand_no_carry(operation_intervals, "add");
                }
                break;
            case "-":
                if(carry)
                {
                    if(rand_nb1>rand_nb2){ operation = [rand_nb1, rand_nb2, rand_nb1-rand_nb2]; }
                    else{ operation = [rand_nb2, rand_nb1, rand_nb2-rand_nb1]; }
                }
                else
                {
                    operation = this.#rand_no_carry(operation_intervals, "remove");
                }
                break;
            case "×":
                operation = [rand_nb1, rand_nb2, rand_nb1*rand_nb2];
                if(operation_type=="result")
                {
                    operation = this.#possible_multiplications(rand_nb1*rand_nb2, operation_intervals, true);
                }
                break;
            case ":":
                if(rand_nb1==0){ rand_nb1=1 }
                operation = [rand_nb1*rand_nb2, rand_nb1, rand_nb2];
                break;
        }

        /*operation.push(operation_type);
        operation.push(operation_sign);*/
        proposals_parameters.set("proposal",operation);
        proposals_parameters.set("type",operation_type);
        proposals_parameters.set("sign",operation_sign);
        return proposals_parameters;
    }
 
    /**
     * return operation without carry
     * @param {int[4]} bornes 
     * @param {string} operation =add, options: 'add' or 'remove' 
     * @returns [nb1:int, nb2:int, result:int]
     */
    #rand_no_carry(intervals,operation="add")
    {
        let nb1_min = intervals[0];
        let nb1_max = intervals[1];
        let nb2_min = intervals[2];
        let nb2_max = intervals[3];

        //substraction case
        if(operation!="add")
        {
            if(nb2_max>nb1_max)
            {
                nb1_min = intervals[2];
                nb1_max = intervals[3];
                nb2_min = intervals[0];
                nb2_max = intervals[1];
            }
        }

        let nb1 = this.#random_int(nb1_min,nb1_max);
        
        let nb_digits_for_all = ((nb2_max+"").length > (nb1+"").length) ? (nb2_max+"").length : (nb1+"").length;

        let nb1_arr = this.#num_in_arr(nb1, nb_digits_for_all);
        let nb2_max_arr = this.#num_in_arr(nb2_max, nb_digits_for_all);
        let nb2_min_arr = this.#num_in_arr(nb2_min, nb_digits_for_all);

        let min_digit = 0;
        let max_digit = 0;
        let nb2 = [];
        let min_activated = true;
        let max_activated = true;

        min_digit = 0;

        //substraction case
        if(operation!="add")
        {
            max_digit = nb1_arr[0];
        }
        else //addition case
        {
            max_digit = 9 - nb1_arr[0];
        }

        min_digit = (min_digit <= nb2_min_arr[0]) ? min_digit : nb2_min_arr[0];
        max_digit = (max_digit <= nb2_max_arr[0]) ? max_digit : nb2_max_arr[0];
        nb2.push( this.#random_int(min_digit, max_digit) );

        for(let i = 1; i<nb_digits_for_all; i++)
        {                    
            if(nb2[i-1] == min_digit && min_activated)
            {
                max_activated = false;
                min_digit = nb2_min_arr[i];

                //substraction case
                if(operation!="add")
                {
                    max_digit = nb1_arr[i];
                }
                else //addition case
                {
                    max_digit = 9 - nb1_arr[i];
                }

                max_digit = (max_digit >= nb2_max_arr[i]) ? max_digit : nb2_max_arr[i];

                //console.log((i+1)+") {min} randInt("+min_digit+", "+max_digit+")");
                nb2.push( this.#random_int(min_digit, max_digit) );
            }
            else if(nb2[i-1] == max_digit && max_activated)
            {
                min_activated = false;
                min_digit = 0;

                //substraction case
                if(operation!="add")
                {
                    max_digit = (nb2_max_arr[i] <= nb1_arr[i]) ? nb2_max_arr[i] : nb1_arr[i];
                }
                else //addition case
                {
                    max_digit = nb2_max_arr[i];
                }

                min_digit = (min_digit <= nb2_min_arr[i]) ? min_digit : nb2_min_arr[i];
                
                //console.log((i+1)+") {max} randInt("+min_digit+", "+max_digit+")");
                nb2.push( this.#random_int(min_digit, max_digit) );
            }
            else
            {
                max_activated = false;
                min_activated = false;

                min_digit = 0;

                //substraction case
                if(operation!="add")
                {
                    max_digit = nb1_arr[i];
                }
                else //addition case
                {
                    max_digit = 9 - nb1_arr[i];
                }

                //console.log((i+1)+") {mid} randInt("+min_digit+", "+max_digit+")");
                nb2.push( this.#random_int(min_digit, max_digit) );
            }
        }

        let nb2_str = "";
        for(let i = 0; i<nb2.length; i++)
        {
            nb2_str += nb2[i];
        }

        nb2 = parseInt(nb2_str);

        //substraction case
        if(operation!="add")
        {
            if(nb1<nb2)
            {
                while(nb1<nb2)
                {
                    if((""+nb2).length==1)
                    {
                        nb2 = (nb1>0) ? nb1-1 : 0;
                    }
                    else
                    {
                        nb2 = parseInt((nb2+"").substring(1,(nb2+"").length));
                    }
                }
            }
            
            console.log(nb1+" - "+nb2+" - "+(nb1-nb2));
            return [nb1,nb2,nb1-nb2];
        }

        return [nb1,nb2,nb1+nb2];
    }

    //in result type operation
    #possible_multiplications(result, intervals, all_order=false)
    {
        //too much possibility with 0 without pedagogical interess
        if(result==0){return [[1,1,1]];}
        
        let nb1_min = intervals[0];
        let nb1_max = intervals[1];
        let nb2_min = intervals[2];
        let nb2_max = intervals[3];
        let proposal = [];
        let nb1_str = '';
        for(let i = nb1_min; i<=nb1_max; i++)
        {
            nb1_str = ""+(result/i);
            if(/\./.test(nb1_str)==false)
            {
                if((result/i)>=nb2_min && (result/i)<=nb2_max)
                {
                    if(all_order)
                    {
                        proposal.push([i,result/i,result]);
                    }
                    else
                    {
                        if(i<=result/i)
                        {
                            proposal.push([i,result/i,result]);
                        }
                    }
                }
            }
        }
        return proposal;
    }
}