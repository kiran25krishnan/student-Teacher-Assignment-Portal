FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN pip install fastapi uvicorn motor python-jose "passlib[bcrypt]" pydantic bcrypt==4.0.1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]