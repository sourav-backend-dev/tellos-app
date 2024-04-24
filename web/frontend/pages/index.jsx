import React, { useEffect, useState } from "react";
import "../components/styles.css";
import { useCallback } from "react";

export default function PricingPage() {
  const [planDetails, setPlanDetails] = useState({ name: "", price: "" });
  const [chargeIdVal, setChargeIdVal] = useState(true);
  const checkChargeID = useCallback(async () => {
    try {
      const host = new URL(document.location).searchParams.get("shop");
      const response = await fetch(`/api/check-charge-id?host=${host}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        redirect: "follow", // Ensure that the browser follows redirects
      });

      if (response.ok) {
        // If the response is successful, parse the JSON body
        const data = await response.json();
        // Return the boolean value indicating if charge ID exists or not
        return data;
      } else {
        // If the response is not successful, throw an error
        throw new Error("Failed to fetch charge ID status");
      }
    } catch (error) {
      console.error("Error checking charge ID:", error);
      // Return false in case of an error
      return false;
    }
  }, []);

  const handleButtonClick = async (name, price) => {
    try {
      const host = new URL(document.location).searchParams.get("shop");
      const response = await fetch(
        `/api/recurring_application_charge?host=${host}&name=${name}&price=${price}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const dataResult = await response.json();
      // Set the plan details received from the server
      setPlanDetails({ name: dataResult.name, price: dataResult.price });
      // Redirect the user to the payment completion URL
      window.location.href = dataResult.confirmation_url;
    } catch (error) {
      console.error("Error fetching active plan:", error);
    }
  };
  checkChargeID().then((result) => {
    if (result) {
      setChargeIdVal(true);
      window.location.href = "https://www.tellos-admin.com/";
    }else{
      setChargeIdVal(false);
    }
  });

  if(chargeIdVal){
    return (
      <></>
    );
  }else{
    return (
      <>
        <nav className="navbar">
          <div className="navbar-logo">
            <img
              src="https://assets-global.website-files.com/64937c656472d090d3fe4d07/64a07038d429f3091438c221_Tellos%20logo%20(1)%20(1)-p-1600.png"
              alt="Example Image"
              height={50}
              width={130}
            />
          </div>
        </nav>

        <div className="pricing-wrapper">
          <div className="pricing-content">
            <div className="pricing-title">
              <h2>Get the right plan for your brand</h2>
            </div>
          </div>

          <div className="pricing-chart-wraaper">
            <div className="pricing-chart char-1">
              <div className="chart-cont1">
                <div className="chart-cont1_1">
                  <div className="chart-title">
                    <h1>Basic</h1>
                  </div>
                  <div className="chart-desc">
                    <p>Best for online brands with up to ~20k visitors/mo</p>
                  </div>
                </div>

                <div className="chart-cont1_2">
                  <div className="chart-pricing-cont">
                    <h1>
                      $49/ <span className="month">month</span>
                    </h1>
                  </div>
                  <div className="chart-pricing-cont">
                    <p>5,000 views/month</p>
                  </div>
                </div>
              </div>

              <div className="chart-cont2">
                <div className="chart-btn">
                  <button onClick={() => handleButtonClick("Basic", 49)}>
                    Contact for free trial
                  </button>
                </div>
              </div>

              <div className="chart-cont3">
                <div className="chart-cont3_1">
                  <h4>Includes:</h4>
                </div>
                <div className="chart-cont3_2">
                  <ul>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ In-video cart integration</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Email and chat support</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Integrate Instagram and TikTok</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Video CMS</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pricing-chart char-1">
              <div className="chart-cont1">
                <div className="chart-cont1_1">
                  <div className="chart-title">
                    <h1>Business</h1>
                  </div>
                  <div className="chart-desc">
                    <p>Best for online brands with up to ~50k visitors/mo</p>
                  </div>
                </div>

                <div className="chart-cont1_2">
                  <div className="chart-pricing-cont">
                    <h1>
                      $199/ <span className="month">month</span>
                    </h1>
                  </div>
                  <div className="chart-pricing-cont">
                    <p>30,000 views/month</p>
                  </div>
                </div>
              </div>

              <div className="chart-cont2">
                <div className="chart-btn">
                  <button onClick={() => handleButtonClick("Business", 199)}>
                    Contact for free trial
                  </button>
                </div>
              </div>

              <div className="chart-cont3">
                <div className="chart-cont3_1">
                  <h4>Everything in Starter, plus:</h4>
                </div>
                <div className="chart-cont3_2">
                  <ul>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Unique EXPLORE view</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Video search</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Performance Optimization</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Assisted implementation</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pricing-chart char-1">
              <div className="chart-cont1">
                <div className="chart-cont1_1">
                  <div className="chart-title">
                    <h1>Premium</h1>
                  </div>
                  <div className="chart-desc">
                    <p>Best for online brands with up to ~150k visitors/mo</p>
                  </div>
                </div>

                <div className="chart-cont1_2">
                  <div className="chart-pricing-cont">
                    <h1>
                      $299/ <span className="month">month</span>
                    </h1>
                  </div>
                  <div className="chart-pricing-cont">
                    <p>100,000 views/month</p>
                  </div>
                </div>
              </div>

              <div className="chart-cont2">
                <div className="chart-btn">
                  <button onClick={() => handleButtonClick("Premium", 299)}>
                    Contact for free trial
                  </button>
                </div>
              </div>

              <div className="chart-cont3">
                <div className="chart-cont3_1">
                  <h4>Everything in Business, plus:</h4>
                </div>
                <div className="chart-cont3_2">
                  <ul>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Dedicated success manager</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Advanced analytics</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Unlimited videos</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Advanced A/B testing</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pricing-chart char-1">
              <div className="chart-cont1">
                <div className="chart-cont1_1">
                  <div className="chart-title">
                    <h1>Growth</h1>
                  </div>
                  <div className="chart-desc">
                    <p>Best for online brands with over 150k visitors/mo</p>
                  </div>
                </div>

                <div className="chart-cont1_2">
                  <div className="chart-pricing-cont">
                    <h1>Custom pricing</h1>
                  </div>
                  <div className="chart-pricing-cont">
                    <p>Unlimited views/month</p>
                  </div>
                </div>
              </div>

              <div className="chart-cont2">
                <div className="chart-btn">
                  <button>Contact for free trial</button>
                </div>
              </div>

              <div className="chart-cont3">
                <div className="chart-cont3_1">
                  <h4>Everything in Premium, plus:</h4>
                </div>
                <div className="chart-cont3_2">
                  <ul>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ AI products auto tagging</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Early access to new features</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ White-Glove onboarding</p>
                      </div>
                    </li>
                    <li>
                      <div className="tick-cont"></div>
                      <div className="list-content">
                        <p>✔ Customizable CTA Buttons</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
