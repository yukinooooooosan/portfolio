export const colors=[
 ['LIME','ライムグリーン','#adf039'],
 ['PINK','ベリーピンク','#ff85ae'],
 ['GRAPE','グレープパープル','#b398f4'],
 ['SODA','ソーダブルー','#75dced'],
 ['MANGO','マンゴーオレンジ','#ffb54f'],
 ['MILK','ミルクホワイト','#fffce7']
];
const drawing=[
'                                ',
'                 ####           ',
'                #HHHH#          ',
'                #HHH#           ',
'                #HH#            ',
'             ######             ',
'          ###bbbbb###           ',
'        ##bbhhhbbbbb##          ',
'       #bbhHHhbbbbbbbb#         ',
'      #bbhHHhbbbbbbbbbbs#       ',
'      #bbhhbbbbbbbbbbbbbs#      ',
'     #bbbbbbbbbbbbbbbbbbs#      ',
'    #bbbb##bbbbbbb##bbbbs#      ',
'    #bbb#WW#bbbbb#WW#bbbbs#     ',
'   #bbbb#KK#bbbbb#KK#bbbbs#     ',
'   #bbbb#KK#bbbbb#KK#bbbbs#     ',
'  #bbbbb ## bbbbb ## bbbbbs#    ',
'  #bbbbbbbbbb##bbbbbbbbbbs#     ',
'  #bbsssbbbbbbbbbbbbbssbbbs#    ',
' #bbbbbbbbbbbbbbbbbbbbbbbs#     ',
' #bbbbbbbbbbbbbbbbbbbbbbbbs#    ',
'#bbbbbbbbbbbbbbbbbbbbbbbbbbss#  ',
'#bbbbbbbbbbbbbbssssbbbbbbbbbss# ',
'#bbbbssssssbbbssssssssbbbbbsss# ',
' #sss######sss########sssssss#  ',
'  ###      ###        #######   ',
'                                ',
'                                '];
function rgb(hex){return hex.match(/[0-9a-f]{2}/ig).map(n=>parseInt(n,16));}
export function drawSlime(canvas,hex,coreRatio=1){
 const c=canvas.getContext('2d'),b=rgb(hex),mix=(col,v)=>'rgb('+b.map((n,i)=>Math.round(n*(1-v)+col[i]*v)).join(',')+')';
 const inks={'#':'#263120',K:'#252920',W:'#fffde7',b:hex,s:mix([49,83,22],.4),H:'#ffffe7',h:mix([255,255,225],.64)};
 const clear={b:'rgba(218,238,247,.36)',s:'rgba(186,213,221,.53)',h:'#deedf1'};
 c.clearRect(0,0,32,28);
 drawing.forEach((row,y)=>[...row].forEach((q,x)=>{
  if(q===' '&&x>7&&x<22&&y===16)q='b';
  if(!inks[q])return;
  const axis=((x-14)/16)**2+((y-17)/13)**2;
  const inShell=coreRatio<1&&axis>=coreRatio;
  c.fillStyle=(inShell&&clear[q])||inks[q];c.fillRect(x,y,1,1);
 }));
}
