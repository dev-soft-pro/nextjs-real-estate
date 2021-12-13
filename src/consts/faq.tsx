import { FAQItem } from 'components/FAQ'

export const pricing: FAQItem[] = [
  {
    question: "How does TopHap's pricing work?",
    answer: (
      <div>
        The free version of TopHap is available to all users. TopHap
        Professional costs $45 per user per month when billed annually and $55
        per user per month when billed monthly. The price of TopHap Expert is
        $126 per user per month when billed annually and $155 when billed
        monthly.
      </div>
    )
  },
  {
    question: 'What forms of payment do you accept?',
    answer: <div>You can purchase TopHap with any major credit card.</div>
  },
  {
    question: 'How can I cancel my subscription?',
    answer: (
      <div>
        You can cancel at any time on the account page. If you cancel your plan
        before the next renewal cycle, you will retain access to paid features
        until the end of your subscription period. When your subscription
        expires, you will lose access to paid features and all data associated
        with those features.
      </div>
    )
  },
  {
    question: 'What is your refund policy?',
    answer: (
      <div>
        We do not offer refunds. If you cancel your plan before the next renewal
        cycle, you will retain access to paid features until the end of your
        subscription period. When your subscription expires, you will lose
        access to paid features and all data associated with those features.
      </div>
    )
  },
  {
    question: 'Where do you get your data?',
    answer: (
      <div>
        TopHap sources data from a number of public and propriatary
        data-sources. Live listings information is provided by the local MLSs.
      </div>
    )
  }
]
