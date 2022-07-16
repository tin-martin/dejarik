import { Scene } from "three";
import * as THREE from 'three';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { STLLoader } from '../jsm/loaders/STLLoader.js';
const loader = new STLLoader();

function toDegrees (angle) {
    return angle * (180 / Math.PI);
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

export class Board{
    constructor(){
        this.grid = [];
        for(var i=0;i<2;i++){
        this.grid.push([0,0,0,0,0,0,0,0,0,0,0,0]);
        } 
        // grid[0] represents inner orbit, grid [1] represents outer orbit
    }
    set(coords,obj){
        this.grid[coords[0]][coords[1]] = obj;
    }
    get(coords){
        return this.grid[coords[0]][coords[1]];
    }
    print(){
        console.log(JSON.stringify(this.grid));
    }
}

export class Entity{
    constructor(coords, team,name,model,b,scene,outlinePass){
        this.outlinePass = outlinePass;
       
        // [ray, orbit]
        this.scene = scene;
        this.b = b;
        this.coords = coords;
        console.log(this.coords);
        this.b.set(this.coords,this);
        //for the Brute's attack 
        this.moved = false;
        this.dead = false;

        this.team = team;

        this.name = name;
        this.scene = scene;

        var geometry;
        loader.load(model,function(geo){
            geometry = geo;
        });    
        this.geometry = geometry;

        window.setTimeout(function(){
           // var hi = new THREE.TextureLoader().load( '/images/hololol.jpg');
          //  const NG_OK_material = new THREE.MeshPhongMaterial( {map:hi} ) ;
           //  
           const material = new THREE.MeshPhongMaterial( {color:team.color} ) ;
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.receiveShadow = true;
            this.mesh.castShadow = true;
            this.mesh.rotateX(-1.5708);
            //
            this.mesh.scale.set(0.8,0.8,0.8);
            this.setPos(coords);
            //
         //   scene.add(this.mesh);
            this.team.join(this);
            this.scene.add(this.mesh);
        
            this.outlinePass.selectedObjects.push(this.mesh);

        }.bind(this),1000);
        
     
        //radius (y displacement) of inner orbit: 65.42 or 80 units
        //radius (y displacement) of outer orbit: 124.69 units
    }
    setPos(coords, iCoords=null){
        let r = coords[0] == 0 ? 80 : 145;
        let d = -15 + 30*coords[1];
        let threeDCoords = [Math.cos(toRadians(d))*r,10, Math.sin(toRadians(d))*r]
        this.mesh.position.set(threeDCoords[0],5,threeDCoords[2]);
        let axis = new THREE.Vector3(0,0,1 );
        if(iCoords != null){
            let iD = -15 + 30*iCoords[1];
            this.mesh.rotateOnAxis(axis,toRadians( -(90-iD)  ));
        }
         // 
        this.mesh.rotateOnAxis(axis,toRadians(90-d));
      
    }
    rayDist(coords1,coords2){
        return coords1[0] == coords2[0] ? 0 : 1;
    }
    orbitDist(coords1,coords2){
        return Math.min(Math.abs(coords1[1] - coords2[1]), Math.abs(12-Math.max(coords1[1],coords2[1])+ Math.min(coords1[1],coords2[1])) );
    }
    diagonalDist(coords1,coords2){
        //console.log(coords1,coords2);
       //console.log("fuck off");
        if(coords1[0] != coords2[0]){
     
            if(this.orbitDist(coords1,coords2)==1){
                
                return 1;
            }
        }
        return -1;
    }
    isLegalMove(coords){
        if(this.b.get(coords) != 0){
            return false;
        }
        return true;
      //overrided by child export class
    }
    isLegalAttack(coords){
        if(this.b.get(coords) == 0){
            return false;
        }
        return true;
    }
    move(coords){
        this.setPos(coords,this.coords);
        this.b.set(this.coords,0);
        this.b.set(coords,this);
        this.moved = true; 
        this.coords = coords; 
        return true;
    }
    attack(coords){
        this.setPos(coords,this.coords);
        let attacked = this.b.get(coords);
        if(attacked != 0){
            attacked.isDead();
            this.b.set(coords,this);
            this.moved = true;  
            this.coords = coords;
            return true;
        }
    }
    isDead(){
        this.dead = true;
        this.scene.remove(this.mesh);
        console.log("someone died");
        //this.remove();
       // this.team.remove(this);
    }
  }
  
  
export class Brute extends Entity{
    isLegalMove(coords){
        if(!super.isLegalMove(coords)){
            return false;
        }
        if(  (this.rayDist(this.coords,coords) == 1 && this.orbitDist(this.coords,coords) == 0)  || this.orbitDist(this.coords,coords) == 1 || this.diagonalDist(this.coords,coords) == 1){
            return true;
        }else if(this.coords[0] == 1 && coords[0] == 1 && (this.coords[1]+6 == coords[1] || this.coords[1]-6 == coords[1]) ){
            return true;
        }
        console.log("-");
        return false;
    }

    isLegalAttack(coords){
        /*
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        */
       console.log(this.coords);
        if(!super.isLegalAttack(coords)){
            console.log("F");
            return false;
        }
        if(this.b.get(coords).moved == false){
            console.log("cannot attack hasnt moved");
            return false;
        }
        if(  (this.rayDist(this.coords,coords) == 1 && this.orbitDist(this.coords,coords) == 0)  || this.orbitDist(this.coords,coords) == 1 || this.diagonalDist(this.coords,coords) == 1){
            return true;
        }
        console.log(this.rayDist(this.coords,coords) == 1 && this.orbitDist(this.coords,coords) == 0);
        console.log(this.orbitDist(this.coords,coords) == 1 );
        console.log(this.diagonalDist(this.coords,coords) == 1);
        console.log("Ffff");
        return false;
    }
}
  
export class Predator extends Entity{
    isLegalMove(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalMove(coords)){
            return false;
        }
        if(this.rayDist(this.coords,coords) == 1 ^ this.orbitDist(this.coords,coords) == 2){
            return true;
        }
        return false;
    }
    isLegalAttack(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalAttack(coords)){
            return false;
        }
        //1 space in Ray, then 2 spaces in Orbit (like an L-shape).
        if(this.orbitDist(this.coords,coords) == 2 && this.rayDist(this.coords,coords) == 1){
            let temp = this.coords[0] == 1 ? 0 : 1;
            let temp2 = 1;
            if(this.b.get([temp,this.coords[1]]) != 0){
                return false;
            }
            if(coords[1] < this.coords[1]){
                temp2 = -1;
            }
            if(this.b.get([coords[0],this.coords[1]+1*temp2]) != 0){
                return false;

            } 
            return true;
        }
    }
}

export class Scout extends Entity{
    isLegalMove(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalMove(coords)){
            return false;
        }
        if(coords == this.coords){
            return true;
        }
        
        if(this.diagonalDist(this.coords,coords) == 1){
            return true;
        }
        
        else if(this.orbitDist(this.coords,coords) == 2){
            return true;
        }
        return false;
        //This piece can move off the start point and back again.
    }
    isLegalAttack(coords){
     /*
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        */
        if(!super.isLegalAttack(coords)){
            return false;
        }
        if(this.rayDist(this.coords,coords) == 1 && this.coords[1] == coords[1]){
            return true;
        }
        return false;
    }
}
export class Guardian extends Entity{
    isLegalMove(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalMove(coords)){
            return false;
        }
        //1 space in Ray, then 2 spaces in Orbit (like an L-shape).
        if(this.orbitDist(this.coords,coords) == 2 && this.rayDist(this.coords,coords) == 1){
            let temp = this.coords[0] == 1 ? 0 : 1;
            let temp2 = 1;
            if(this.b.get([temp,this.coords[1]]) != 0){
                return false;
            }
            if(coords[1] < this.coords[1]){
                temp2 = -1;
            }
            if(this.b.get([coords[0],this.coords[1]+1*temp2]) != 0){
                return false;
            } 
            return true;
        }
        //This piece can move off the start point and back again.
    }
    isLegalAttack(coords){
        if(coords instanceof Entity){
            coords = coords.coords;
        }
        if(!super.isLegalAttack(coords)){
            return false;
        }
        //2 spaces in Orbit.
        if(this.orbitDist(this.coords,coords) != 2 || this.coords[0] != coords[0]){
            return false;
        }
        //make sure nothing is in between this.coords and coords
        if( this.b.get([this.coords[0],Math.min(this.coords[1],coords[1])+1]) != 0  ){
            return false;
        }
            return true;
    }
}

export class Team{
    constructor(name,color){
        this.name = name;
        this.color = color;
        this.group = new THREE.Group();
        this.members = [];
     
    }
    
    join(member){   
        this.members.push(member);
     
    }
}


/*


//movement debugged: predator, brute ,scout, guardian



//attack debugged: brute,predator, scout, guardian

//keeps track of active team
/*
var activeTeam = team1;

//for sudden death
let team1Counter = 3;
let team2Counter = 3;


function action(coordX, coordY,attackChaining=false){
    //replace all this shtuff with mouse pointing action !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // ACOUNT FOR ANIMATION AND GRPAHICS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //coordX, coordY replaced by mouse_x, mouse_y

    if( entity.attack([coordX,coordY]) ){
        //attack
         //restart sudden death
        if(entity.team.length == 1){
            if(team1 == entity.team){
                team1counter = 3;
            }else{
                team2counter =3;
            }
        }
        action(true);
    }else if( entity.move([coordX,coordY]) ){
        //move
        if(!entity.attack([coordX,coordY])){
            console.log("you can't do it and u screed it all up");
        }

        //for sudden death;
        if(entity.team.length == 1){
            if(team1 == entity.team){
                team1counter -= 1;
            }else{
                team2counter -= 1;
            }
        }
    }else{
        console.log("you can't do it and u screed it all up");
        action(attackChaining);
    }   
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }
}


function gameLoop(){
    //REPLACE WITH automatic !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let action = input('Move (Enter "M") or Attack (Enter "A"): ');
    let entityInput = input('Choose entity: ');
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let entity;
    for(let e in team1){
        if(e.name == entityInput){
            entity = e;
            break;
        }
    }
    action();
//Scout: IMPORTANT!! --> Can attack before or after moving, but can only attack once.
    if(entity instanceof Scout){
        action();
    }
    //switches inactive team to active team
    activeTeam = activeTeam == team1 ? team2 : team1;
}
//gameloop
while(team1.length > 0 && team2.length > 0){
    if(team1Counter == 0 || team2Counter == 0){
        break;
    }
    gameLoop();
}



*/
