import React from 'react'
import { Link } from 'react-router-dom'

const PracticeOne = () => {
  return (
    <div>
      <h3>Tumour Suppressor Gene (TP53)</h3>
      <p>Select an exercise for TP53 gene analysis</p>
      <hr className='divider' />
      <div className="practice">
        <div>
          <p><strong>Exercise 1: Plasmid Construction and Expression</strong> </p>
          <Link to="/exercise-one">[Open]</Link>
        </div>
        <p>Summary: Describing the process of constructing plasmids for TP53 gene analysis and their expression in mammalian cells.</p>
      </div>
    </div>
  )
}

export default PracticeOne