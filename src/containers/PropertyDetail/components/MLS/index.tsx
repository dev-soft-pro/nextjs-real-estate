export default function MLS({ mls }: { mls: TopHap.MLS }) {
  return (
    <section className='th-mls-section'>
      <img
        className='th-mls-logo'
        src={`https://s3-us-west-2.amazonaws.com/tophap-assets/mls/${mls.logo}`}
        alt={mls.name}
      />
      <span dangerouslySetInnerHTML={{ __html: mls.disclaimer }} />

      <style jsx>
        {`
          .th-mls-section {
            color: #858585;
            font-size: 14px;
            margin-top: 32px;
          }

          .th-mls-logo {
            height: 16px;
            margin-right: 12px;
          }
        `}
      </style>
    </section>
  )
}
