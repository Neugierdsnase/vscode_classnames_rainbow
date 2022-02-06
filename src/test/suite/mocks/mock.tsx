/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck
import React, { FunctionComponent } from 'react'

type MockProps = {
  some: 'thing'
}

export const Mock: FunctionComponent<MockProps> = ({ some }) => {
  if (!some) {
    return <p className="a few atomic css classes here">There are none</p>
  }

  return (
    <div
      className={`this is classlist in a template literal and ${
        true ? 'conditional classes' : ''
      }`}
    >
      <section>
        <h1>Some header</h1>
        <p>
          And some <span className="and i am in single quotes">more</span> text.
        </p>
      </section>
    </div>
  )
}
