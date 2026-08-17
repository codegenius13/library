import React from 'react'
import { Link } from 'react-router-dom'

const PracticeOne = () => {
  return (
    <div>
      <h3>Plant Research Studies</h3>
      <p>Select an exercise for plant research analysis</p>
      <hr className='divider' />
      <div className="practice">
        <div>
          <p><strong>Exercise 1: Maize Environmental Stress–to–Metabolic Response Analysis</strong> </p>
          <Link to="/exercise-one">[Open]</Link>
        </div>
        <p>Summary: Analyzing the metabolic responses of maize plants under different environmental stress conditions.</p>
      </div>
    </div>
  )
}

export default PracticeOne