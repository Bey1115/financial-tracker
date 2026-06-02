export default function CategoryCard({

 title,
 items

}){

 const total = items
   .filter(i => i.checked)
   .reduce(
      (sum,i)=>
      sum+i.amount,
      0
   );

 return(

  <div>

    <h3>{title}</h3>

    {items.map(item=>(

      <div key={item.id}>

        <input
          type="checkbox"
          checked={item.checked}
        />

        {item.name}

        ₱{item.amount}

      </div>

    ))}

    <h4>Total ₱{total}</h4>

  </div>

 )

}