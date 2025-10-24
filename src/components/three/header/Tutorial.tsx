const Tutorial = () => {
  return (
    <div
      id="tutorial"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "4rem",
        color: "black",
        fontSize: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          paddingTop: "0.5rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={39}
          fill="none"
        >
          <g fill="#000" filter="url(#a)">
            <path d="m16.881 13.561-2.83-.48a1 1 0 0 0-1.154.819L9.358 34.756a1 1 0 0 0 .819 1.153l2.83.48a1 1 0 0 0 1.154-.818L17.7 14.715a1 1 0 0 0-.819-1.154Z" />
            <path d="M15.886 22.108c5.691 0 10.304-4.613 10.304-10.304 0-5.69-4.613-10.304-10.304-10.304-5.69 0-10.303 4.613-10.303 10.304 0 5.69 4.613 10.304 10.303 10.304ZM20.09 35.051H2.5a1 1 0 0 0-1 1v.449a1 1 0 0 0 1 1h17.59a1 1 0 0 0 1-1v-.449a1 1 0 0 0-1-1Z" />
          </g>
          <defs>
            <filter
              id="a"
              width={27.69}
              height={39}
              x={0}
              y={0}
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                baseFrequency="0.098039217293262482 0.098039217293262482"
                numOctaves={3}
                seed={7158}
                type="fractalNoise"
              />
              <feDisplacementMap
                width="100%"
                height="100%"
                in="shape"
                result="displacedImage"
                scale={3}
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feMerge result="effect1_texture_188_139">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <p>Marcher</p>
      </div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          paddingTop: "0.5rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={38}
          height={37}
          fill="none"
        >
          <g clipPath="url(#a)" filter="url(#b)">
            <path
              fill="#000"
              d="M1.708 13.518a.693.693 0 0 0 .6.871l14.79 1.533a.89.89 0 0 1-.025 1.776c-2.168.153-7.324.584-10.686 1.413-2.14.527-3.945 1.965-4.853 3.954-.955 2.094-1.332 5.22 1.253 9.156 0 0 8.145 7.96 16.028-3.303l1.06.134s3.44 8.998 14.523 5.49a1.573 1.573 0 0 0 1.094-1.297l.89-7.032C39.09.756 21.252 1.103 19.264 1.219a21.45 21.45 0 0 1-.401.017c-1.801.056-14.014.857-17.155 12.282Z"
            />
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M1.2 1.106h36v35h-36z" />
            </clipPath>
            <filter
              id="b"
              width={38.4}
              height={37.4}
              x={0}
              y={-0.094}
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                baseFrequency="0.10204081237316132 0.10204081237316132"
                numOctaves={3}
                seed={1592}
                type="fractalNoise"
              />
              <feDisplacementMap
                width="100%"
                height="100%"
                in="shape"
                result="displacedImage"
                scale={2.4}
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feMerge result="effect1_texture_181_128">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <p>Courir</p>
      </div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          paddingTop: "0.5rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={38}
          height={38}
          fill="none"
        >
          <g clipPath="url(#a)" filter="url(#b)">
            <path
              fill="#000"
              d="M35.131 1.202h-.001l-15.38.831a.5.5 0 0 0-.472.524l.42 8.696a.2.2 0 0 1-.18.208l-.216.021a.011.011 0 0 1-.012-.012.011.011 0 0 0-.01-.011l-.717-.03a.5.5 0 0 1-.479-.496L18.01 2.51a.5.5 0 0 0-.501-.496l-15.048.05a.477.477 0 0 0-.459.333c-.595 1.94-3.138 11.821 5.616 15.434.476.196.517 1.117.065 1.365-2.73 1.5-7.501 5.68-5.867 16.168a.504.504 0 0 0 .472.425l15.016.602a.5.5 0 0 0 .519-.468l.565-8.988a.342.342 0 0 1 .356-.32l.26.01c.03.002.055.027.056.057.002.034.031.06.065.056l.648-.064a.5.5 0 0 1 .545.438l1.059 8.785a.5.5 0 0 0 .544.438L36.88 34.88a.504.504 0 0 0 .447-.451c1.034-10.564-3.966-14.464-6.778-15.807-.465-.222-.477-1.144-.012-1.367 9.445-4.542 4.636-15.968 4.6-16.054-.001-.002-.003 0-.005.001Z"
            />
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M.693.975h36v35.852h-36z" />
            </clipPath>
            <filter
              id="b"
              width={38.4}
              height={38.252}
              x={-0.507}
              y={-0.225}
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                baseFrequency="0.10204081237316132 0.10204081237316132"
                numOctaves={3}
                seed={9197}
                type="fractalNoise"
              />
              <feDisplacementMap
                width="100%"
                height="100%"
                in="shape"
                result="displacedImage"
                scale={2.4}
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feMerge result="effect1_texture_181_119">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <p>Sauter</p>
      </div>
    </div>
  );
};

export default Tutorial;
