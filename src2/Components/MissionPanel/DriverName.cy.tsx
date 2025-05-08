import { DriverName } from './DriverName'

describe('<DriverName />', () => {

  it('renders', () => {
    // see: https://on.cypress.io/mounting-react

    // Generate random name
    const name = Math.random().toString(36).substring(7)

    // @ts-ignore
    cy.mount(<DriverName name={name} />)

    cy.contains(name).should('be.visible')

    cy.get('[data-testid="PhoneEnabledIcon"]').should('be.visible')
  })

  it('should call the driver when clicking on the phone icon', () => {
    const name = Math.random().toString(36).substring(7)

    // @ts-ignore
    cy.mount(<DriverName name={name} />)

    cy.get('[data-testid="PhoneEnabledIcon"]').click()
    
    cy.contains("Calling " + name).should('be.visible')
    cy.contains("Please note that the driver may not be able to answer the phone while driving.").should('be.visible')
    cy.contains("If your browser doesnt support calling, please call").should('be.visible')
  })

  it('should cancel the call when pressing the esc key', () => {
    const name = Math.random().toString(36).substring(7)

    // @ts-ignore
    cy.mount(<DriverName name={name} />)


    // It should NOT open a new _blank tab
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
    })


    cy.get('[data-testid="PhoneEnabledIcon"]').click()
    
    cy.contains("Calling " + name).should('be.visible')
    cy.contains("Please note that the driver may not be able to answer the phone while driving.").should('be.visible')
    cy.contains("If your browser doesnt support calling, please call").should('be.visible')

    cy.get('body').type('{esc}')
    cy.contains("Calling " + name).should('not.be.visible')

    // Sleep 3 seconds to make sure the timeout is not called
    cy.get('@windowOpen').should('not.be.called')

  })

  it('should fire the call if not cancelled', () => {
    const name = Math.random().toString(36).substring(7)

    // @ts-ignore
    cy.mount(<DriverName name={name} />)

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen')
    })


    cy.get('[data-testid="PhoneEnabledIcon"]').click()
    
    cy.contains("Calling " + name).should('be.visible')
    cy.contains("Please note that the driver may not be able to answer the phone while driving.").should('be.visible')
    cy.contains("If your browser doesnt support calling, please call").should('be.visible')

    cy.get('body').type('{esc}')
    cy.contains("Calling " + name).should('not.be.visible')

    cy.get('@windowOpen').should('be.calledOnce')

  })

})