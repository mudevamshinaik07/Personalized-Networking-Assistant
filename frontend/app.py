import streamlit as st
import requests

st.set_page_config(page_title="Personalized Networking Assistant")

st.title("🤝 Personalized Networking Assistant")

st.write("Welcome to the Personalized Networking Assistant!")

name = st.text_input("Your Name")
profession = st.text_input("Profession")
event = st.text_input("Event Name")

if st.button("Generate Networking Starter"):

    if event == "":
        st.error("Please enter an event name.")
    else:

        url = f"http://127.0.0.1:8000/event/{event}"

        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()

            st.success("Networking Starter Generated!")

            st.write(data)

        else:
            st.error("Backend Error")