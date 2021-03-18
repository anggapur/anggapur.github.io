<?php

class HomeController
{
    public function index()
    {                       
        include 'view/index.php';
    }

    public function getAverage($params)
    {  
        // Get Data
        $data = $this->get_payload();
        $datas = $data->data;

        // Check Data Have elements
        if(count($datas) <= 0)
        {
            echo $this->json_response(422, "Need to Input Some Data");
            return;
        }

        // Pluck Data
        $ageOfDeaths = array_column($datas,'ageOfDeath');
        $yearOfDeaths = array_column($datas,'yearOfDeath');
        // Get Min
        $minAgeOfDeaths = min($ageOfDeaths);
        $minYearOfDeaths = min($yearOfDeaths);       
        if($minYearOfDeaths < 0 || $minAgeOfDeaths < 0)
        {
            echo $this->json_response(422, "Age of Death or Year of Death Must be Greated Than 0");
            return;
        } 
        else 
        {
            // Get Different between Year of Death and Age of Death 
            $listDiff = [];
            foreach($datas as $val){
                // Cek if differemt is negatove then stop
                if( ($val->yearOfDeath-$val->ageOfDeath) < 0){
                    echo $this->json_response(422, "Year of Death must Bigger Than Age of Death");
                    return;
                }

                array_push($listDiff, ($val->yearOfDeath-$val->ageOfDeath));

            }
            // Find Biggest Different
            $maxDiff = max($listDiff);
            $minDiff = min($listDiff);

            // Fibonancci
            $fibonacci = $this->accumulation_fibonacci($maxDiff);        

            // Make Message
            $results = [];
            $listFiboResults = [];
            for($i = count($datas)-1 ; $i >=0 ; $i--)
            {
                $val = $datas[$i];
                $diff = ($val->yearOfDeath-$val->ageOfDeath);
                $killedOnYear = $fibonacci[$diff];
                array_push($listFiboResults,$killedOnYear);
                $msg = $val->personName.' born on Year '.$val->yearOfDeath.'-'.$val->ageOfDeath.', number of people killed on year '.$diff.' is '.$killedOnYear;
                array_push($results, $msg);
            }
            
            // Average Message
            $arrange = implode(" + ",$listFiboResults);
            $count = count($listFiboResults);
            $average = array_sum($listFiboResults) / $count;
            $msg = "So the average is ( ".$arrange." ) / ".$count." = ".$average;
            array_push($results, $msg);

            echo $this->json_response(200, $results);
            // echo $this->json_response(200, $maxDiff);
            return;
        }
        
    }    

    public function accumulation_fibonacci($max)
    {
        // Prepare 2 first number
        $prev_number=0;
        $curr_number=1;
        $accumulation = $prev_number+$curr_number;
        
        //simpan string angka awal
        $resultData = [$prev_number,$curr_number];
        
        for ($i=0; $i<$max-1; $i++)
        {        
            $output = $curr_number + $prev_number;      
            $accumulation+=$output;  
            array_push($resultData, $accumulation);
                    
            $prev_number = $curr_number;
            $curr_number = $output;
        }
        return $resultData;
    }
    
    public function get_payload(){
        $request_body = file_get_contents('php://input');
        $data = json_decode($request_body);
        return $data;
    }

    // Json Helper
    public function json_response($code = 200, $message = null)
    {
        // clear the old headers
        header_remove();
        // set the actual code
        http_response_code($code);
        // set the header to make sure cache is forced
        // header("Cache-Control: no-transform,public,max-age=300,s-maxage=900");
        // treat this as json
        header('Content-Type: application/json');
        $status = array(
            200 => '200 OK',
            400 => '400 Bad Request',
            422 => 'Unprocessable Entity',
            500 => '500 Internal Server Error'
            );
        // ok, validation error, or failure
        header('Status: '.$status[$code]);
        // return the encoded json
        return json_encode(array(
            'status' => $code < 300, // success or not?
            'message' => $message
            ));
    }
}